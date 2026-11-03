import { useEffect, useState } from 'react';
import { ChevronDown, Cloud, Download, LogIn } from 'lucide-react';
import type { useProgress } from './useProgress';
import { cloudConfigured, readSession, signIn, signOut, supabase } from './supabase';
export default function CloudProgress({ progress }: { progress: ReturnType<typeof useProgress> }) {
  const [session, setSession] = useState(readSession);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    const subscription = supabase?.auth.onAuthStateChange((_event, next) => setSession(next));
    return () => subscription?.data.subscription.unsubscribe();
  }, []);
  if (!cloudConfigured) return null;
  const backup = () => {
    const url = URL.createObjectURL(new Blob([JSON.stringify(progress.journal, null, 2)], { type: 'application/json' }));
    const a = document.createElement('a'); a.href = url; a.download = 'hogwarts-progress-backup.json'; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  return <details className="panel cloud-progress" aria-label="Облачное сохранение">
    <summary><span className="cloud-entry-icon" aria-hidden="true">{session ? <Cloud size={30} /> : <LogIn size={30} />}</span><span className="cloud-entry-copy"><strong>{session ? 'Облачное сохранение' : 'Войти'}</strong><span>{session ? (progress.conflicts.length ? 'Есть конфликт' : Object.keys(progress.journal.pending).length ? 'Есть несинхронизированные изменения' : progress.status || 'Подключение…') : 'Облачное сохранение'}</span></span><ChevronDown className="cloud-entry-chevron" size={24} aria-hidden="true" /></summary>
    {!session ? <form onSubmit={async e => {
      e.preventDefault(); setBusy(true); setMessage('');
      try { setSession(await signIn(email, password)); setPassword(''); await progress.sync(); }
      catch (e) { setMessage(e instanceof Error ? e.message : 'Вход недоступен. Попробуйте снова.'); }
      finally { setBusy(false); }
    }}>
      <label><input aria-label="Email" type="email" autoComplete="username" value={email} onChange={e => setEmail(e.target.value)} required /></label>
      <label>Пароль <input type="password" autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} required /></label>
      <button className="btn cloud-signin-button" disabled={busy}><LogIn size={23} aria-hidden="true" />{busy ? 'Входим…' : 'Войти'}</button>
    </form> : <>
      <p>{session.user.email}</p>
      <p role="status">{progress.status}</p>
      <button className="pill" onClick={() => void progress.sync()}>Синхронизировать</button>{' '}
      <button className="pill" disabled={busy} onClick={async () => {
        setBusy(true);
        try { await signOut(); setSession(null); } catch (e) { setMessage(e instanceof Error ? e.message : 'Выход недоступен.'); }
        finally { setBusy(false); }
      }}>Выйти</button>
    </>}
    {message && <p role="alert">{message}</p>}
    {progress.importSkipped > 0 && <p role="status">Перенос завершён. Для {progress.importSkipped} полей сохранена облачная версия. Исходный локальный прогресс доступен в резервной копии.</p>}
    {progress.conflicts.map(key => <div key={key}>
      <p>Поле «{key}» изменено на другом устройстве. Обе версии сохранены; выберите нужную.</p>
      <p>В этом браузере: <code>{JSON.stringify(progress.journal.pending[key].value)}</code></p>
      <p>В облаке: <code>{JSON.stringify(progress.journal.cloud[key]?.value)}</code></p>
      <button className="pill" onClick={() => progress.choose(key, 'cloud')}>Использовать облачную версию</button>{' '}
      <button className="pill" onClick={() => progress.choose(key, 'local')}>Сохранить локальную версию в облако</button>
    </div>)}
    <button className="text-btn cloud-backup-icon" aria-label="Скачать резервную копию прогресса" title="Скачать резервную копию прогресса" onClick={backup}><Download size={23} aria-hidden="true" /></button>
  </details>;
}
