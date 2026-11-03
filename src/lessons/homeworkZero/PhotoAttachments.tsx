import { useEffect, useRef, useState } from 'react';
import { ImagePlus, Paperclip, Trash2, Upload } from 'lucide-react';
import type { LessonProps } from '../types';
import { readSession, supabase } from '../../supabase';
import { deleteLocalPhoto, isDeletedPhoto, isMissingPhoto, isPhoto, localPhotos, photoBucket, photoPath, photoPrefix, saveLocalPhoto, validatePhoto } from './photoStore';
import type { LocalPhoto, Photo } from './photoStore';

function PhotoPreview({ local, cloud }: { local?: LocalPhoto; cloud?: Photo }) {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    let objectUrl = '';
    if (local) { objectUrl = URL.createObjectURL(local.file); setUrl(objectUrl); }
    else if (cloud && supabase) {
      setUrl(''); setError('');
      void supabase.storage.from(photoBucket).createSignedUrl(cloud.path, 600).then(({ data, error }) => {
        if (!active) return;
        if (error || !data) setError('Не удалось открыть фото. Проверь вход и подключение.');
        else setUrl(data.signedUrl);
      });
    }
    return () => { active = false; if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [local?.file, cloud?.path]);
  return <>{url ? <a href={url} target="_blank" rel="noreferrer"><img src={url} alt={`Фото домашней работы: ${(local || cloud)!.name}`} /><span>Открыть фото</span></a> : <p>{error || 'Загружаем фото…'}</p>}</>;
}
export default function PhotoAttachments({ state, setState }: LessonProps) {
  const input = useRef<HTMLInputElement>(null);
  const mounted = useRef(true);
  const uploading = useRef(new Set<string>());
  const [session, setSession] = useState(readSession);
  const [local, setLocal] = useState<LocalPhoto[]>([]);
  const [busy, setBusy] = useState<string[]>([]);
  const [error, setError] = useState('');
  useEffect(() => {
    mounted.current = true;
    void localPhotos().then(photos => { if (mounted.current) setLocal(photos); }).catch(e => { if (mounted.current) setError(e.message); });
    const subscription = supabase?.auth.onAuthStateChange((_event, next) => setSession(next));
    return () => { mounted.current = false; subscription?.data.subscription.unsubscribe(); };
  }, []);
  const owner = session?.user.id;
  const cloud = Object.entries(state.answers).filter(([key, value]) => key.startsWith(photoPrefix) && isPhoto(value)).map(([, value]) => value as Photo).filter(photo => photo.owner === owner);
  const visibleLocal = local.filter(photo => (!photo.owner || photo.owner === owner) && !isDeletedPhoto(state.answers[photoPrefix + photo.id]));
  const ids = [...new Set([...cloud.map(p => p.id), ...visibleLocal.map(p => p.id)])];
  useEffect(() => {
    // A synced deletion must also remove the cached Blob on another device.
    for (const photo of local) if (photo.owner === owner && isDeletedPhoto(state.answers[photoPrefix + photo.id])) {
      void deleteLocalPhoto(photo.id).then(() => { if (mounted.current) setLocal(previous => previous.filter(item => item.id !== photo.id)); }).catch(e => { if (mounted.current) setError(e.message); });
    }
  }, [local, owner, state.answers]);
  const upload = async (photo: LocalPhoto) => {
    if (!supabase || !owner || photo.deleteRequested || isDeletedPhoto(state.answers[photoPrefix + photo.id]) || uploading.current.has(photo.id)) return;
    uploading.current.add(photo.id); setBusy(previous => [...previous, photo.id]); setError('');
    try {
      // Bind before uploading: another signed-in user must never inherit this queue.
      const bound = { ...photo, owner };
      await saveLocalPhoto(bound);
      if (mounted.current) setLocal(previous => previous.map(item => item.id === photo.id ? bound : item));
      const path = photoPath(owner, photo.id, photo.mime);
      const { error } = await supabase.storage.from(photoBucket).upload(path, photo.file, { contentType: photo.mime, upsert: false });
      if (error && String((error as { statusCode?: string }).statusCode) !== '409') throw error;
      // Confirm visibility before recording metadata, including response-lost retries.
      const signed = await supabase.storage.from(photoBucket).createSignedUrl(path, 600);
      if (signed.error) throw signed.error;
      if (!mounted.current || readSession()?.user.id !== owner) return;
      const metadata: Photo = { id: photo.id, owner, path, name: photo.name, mime: photo.mime, createdAt: photo.createdAt };
      setState(previous => isDeletedPhoto(previous.answers[photoPrefix + photo.id]) ? previous : ({ ...previous, answers: { ...previous.answers, [photoPrefix + photo.id]: metadata } }));
    } catch {
      if (mounted.current) setError('Облачная загрузка не завершена. Фото сохранено в этом браузере — попробуй отправить снова. Если ошибка повторяется, проверь настройку закрытого хранилища Supabase.');
    } finally {
      uploading.current.delete(photo.id);
      if (mounted.current) setBusy(previous => previous.filter(id => id !== photo.id));
    }
  };
  const remove = async (own?: LocalPhoto, remote?: Photo) => {
    const photo = own || remote;
    if (!photo || uploading.current.has(photo.id) || !window.confirm(`Удалить фотографию «${photo.name}»?`)) return;
    uploading.current.add(photo.id); setBusy(previous => [...previous, photo.id]); setError('');
    try {
      if (remote || own?.owner) {
        if (!supabase || !owner || photo.owner !== owner) throw new Error('Для удаления облачного фото войди в свой аккаунт.');
        // Persist the intent before Storage: reloads and lost replies remain retryable.
        const pending: LocalPhoto = { ...photo, owner, file: own?.file || new Blob(), deleteRequested: true };
        await saveLocalPhoto(pending);
        if (mounted.current) setLocal(previous => [...previous.filter(item => item.id !== photo.id), pending]);
        const path = remote?.path || photoPath(owner, photo.id, photo.mime);
        const result = await supabase.storage.from(photoBucket).remove([path]);
        if (result.error) throw new Error('Не удалось подтвердить удаление в облаке. Проверь подключение и повтори.');
        // Storage may return success with an empty result when DELETE RLS denies it.
        // Do not hide the photo unless the object is confirmed absent.
        const check = await supabase.storage.from(photoBucket).createSignedUrl(path, 600);
        if (!isMissingPhoto(check.error)) throw new Error('Удаление не подтверждено. Проверь подключение и настройку удаления в Supabase, затем повтори.');
        if (readSession()?.user.id !== owner) return;
        // An explicit marker survives expand(), which omits generic null tombstones.
        setState(previous => ({ ...previous, answers: { ...previous.answers, [photoPrefix + photo.id]: { deleted: true, id: photo.id, owner } } }));
      }
      await deleteLocalPhoto(photo.id);
      if (mounted.current) setLocal(previous => previous.filter(item => item.id !== photo.id));
    } catch (e) {
      if (mounted.current) setError(e instanceof Error ? e.message : 'Не удалось удалить фото. Попробуй снова.');
    } finally {
      uploading.current.delete(photo.id);
      if (mounted.current) setBusy(previous => previous.filter(id => id !== photo.id));
    }
  };
  const add = async (files: File[]) => {
    setError('');
    for (const file of files) {
      try {
        validatePhoto(file);
        // Decode to reject corrupt images before claiming they are attached.
        const url = URL.createObjectURL(file);
        try { const image = new Image(); image.src = url; await image.decode(); }
        finally { URL.revokeObjectURL(url); }
        const photo: LocalPhoto = { id: crypto.randomUUID(), owner: owner || null, name: file.name, mime: file.type, createdAt: new Date().toISOString(), file };
        await saveLocalPhoto(photo);
        if (!mounted.current) return;
        setLocal(previous => [...previous, photo]);
        if (owner) await upload(photo);
      } catch (e) { if (mounted.current) setError(e instanceof Error ? e.message : 'Не удалось прикрепить фото.'); }
    }
  };
  return <section className="hw0-task hw0-attachments" aria-labelledby="hw0-photos-title">
    <h2 id="hw0-photos-title"><Paperclip size={32} aria-hidden="true" />Фотографии домашней работы</h2>
    <div className="hw0-photo-picker"><ImagePlus size={42} aria-hidden="true" /><button type="button" className="btn" onClick={() => input.current?.click()}><Paperclip size={24} aria-hidden="true" />Прикрепить фотографии</button><input ref={input} type="file" accept="image/jpeg,image/png,image/webp" multiple hidden aria-label="Выбрать фотографии домашней работы" onChange={e => { const files = Array.from(e.target.files || []); e.target.value = ''; void add(files); }} /><p>JPG, PNG или WebP — до 8 МБ на фото.</p></div>
    {!owner && <p>Войди в свой аккаунт, чтобы отправить фото в облако. Пока они сохраняются в этом браузере.</p>}
    {error && <p role="alert">{error}</p>}
    <div className="hw0-photo-grid">{ids.map(id => {
      const own = visibleLocal.find(photo => photo.id === id);
      const remote = cloud.find(photo => photo.id === id);
      return <article className="hw0-photo" key={id}><PhotoPreview local={own?.file.size ? own : undefined} cloud={remote} /><p>{(own || remote)!.name}</p><p role="status">{busy.includes(id) ? own?.deleteRequested ? 'Удаляем…' : 'Отправляем…' : own?.deleteRequested ? 'Удаление не завершено — можно повторить' : remote ? 'Файл загружен. Облачный статус — в панели входа.' : 'Сохранено на этом устройстве'}</p>{own && !remote && owner && !own.deleteRequested && <button type="button" className="btn" disabled={busy.includes(id)} onClick={() => void upload(own)}><Upload size={22} aria-hidden="true" />Отправить в облако</button>}<button type="button" className="btn hw0-delete-photo" disabled={busy.includes(id)} aria-label={`Удалить фото ${photoName(own, remote)}`} onClick={() => void remove(own, remote)}><Trash2 size={22} aria-hidden="true" />{own?.deleteRequested ? 'Повторить удаление' : 'Удалить фото'}</button></article>;
    })}</div>
  </section>;
}
const photoName = (local?: LocalPhoto, cloud?: Photo) => (local || cloud)?.name || '';
