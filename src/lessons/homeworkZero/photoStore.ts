export const photoBucket = 'homework-photos';
export const photoPrefix = '@vika/lesson/lesson-0-homework/photo/';
export const maxPhotoSize = 8 * 1024 * 1024;
export type Photo = { id: string; owner: string; path: string; name: string; mime: string; createdAt: string };
export type LocalPhoto = { id: string; owner: string | null; name: string; mime: string; createdAt: string; file: Blob };
export function validatePhoto(file: Pick<File, 'type' | 'size'>) {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) throw new Error('Выбери фотографию JPG, PNG или WebP. HEIC нужно сначала сохранить как JPG.');
  if (!file.size || file.size > maxPhotoSize) throw new Error('Размер фотографии должен быть от 1 байта до 8 МБ.');
}
export function photoPath(owner: string, id: string, mime: string) {
  return `${owner}/homework-0/${id}.${mime === 'image/jpeg' ? 'jpg' : mime === 'image/png' ? 'png' : 'webp'}`;
}
export function isPhoto(value: unknown): value is Photo {
  if (!value || typeof value !== 'object') return false;
  const p = value as Photo;
  return typeof p.id === 'string' && /^[\da-f-]{36}$/i.test(p.id) &&
    typeof p.owner === 'string' && /^[\da-f-]{36}$/i.test(p.owner) &&
    ['image/jpeg', 'image/png', 'image/webp'].includes(p.mime) &&
    p.path === photoPath(p.owner, p.id, p.mime) && typeof p.name === 'string' && typeof p.createdAt === 'string';
}
function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('vika-homework-photos', 1);
    request.onupgradeneeded = () => request.result.createObjectStore('photos', { keyPath: 'id' });
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(new Error('Не удалось сохранить фото в браузере. Не закрывай страницу и попробуй снова.'));
  });
}
export async function localPhotos(): Promise<LocalPhoto[]> {
  const db = await openDatabase();
  try {
    return await new Promise((resolve, reject) => {
      const tx = db.transaction('photos', 'readonly');
      const request = tx.objectStore('photos').getAll();
      tx.oncomplete = () => resolve(request.result);
      tx.onerror = tx.onabort = () => reject(new Error('Не удалось прочитать сохранённые фотографии.'));
    });
  } finally { db.close(); }
}
export async function saveLocalPhoto(photo: LocalPhoto): Promise<void> {
  const db = await openDatabase();
  try {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction('photos', 'readwrite');
      tx.objectStore('photos').put(photo);
      tx.oncomplete = () => resolve();
      tx.onerror = tx.onabort = () => reject(new Error('Не хватает места для фото в браузере. Файл не прикреплён.'));
    });
  } finally { db.close(); }
}
