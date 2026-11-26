import { useCallback, useEffect, useRef, useState } from 'react';
import type { SetStateAction } from 'react';
import { initial } from './data';
import type { LessonState } from './data';
import { bind, expand, journalKey, legacyKey, loadLegacy, newJournal, reconcile } from './progress';
import type { Journal } from './progress';
import { readDurable, writeOperation } from './progressStorage';
import { cloudConfigured, readSession, supabase, syncProgress } from './supabase';

function safeLegacy(): LessonState {
  try { return loadLegacy(localStorage); } catch { return structuredClone(initial); }
}
function readJournal(): Journal { return readDurable(localStorage).journal; }
export function useProgress() {
  const [journal, setJournal] = useState<Journal>(() => {
    try { return readJournal(); } catch { return newJournal(safeLegacy()); }
  });
  const current = useRef(journal);
  const volatile = useRef(false);
  const [error, setError] = useState(() => {
    try { readJournal(); return ''; } catch { return 'Локальное сохранение недоступно. Не очищайте данные браузера.'; }
  });
  const [phase, setPhase] = useState<'idle' | 'reading' | 'writing' | 'error'>('idle');
  const [syncError, setSyncError] = useState('');
  const [online, setOnline] = useState(navigator.onLine);
  const [userId, setUserId] = useState(() => readSession()?.user.id);
  const [confirmed, setConfirmed] = useState<string>();
  const [teacher, setTeacher] = useState<{ user: string; learner: string; state: LessonState }>();
  const access = useRef<{ user: string; readOnly: boolean } | undefined>(undefined);

  const [importSkipped, setImportSkipped] = useState(0);
  const busy = useRef(false);
  const serial = useRef(Promise.resolve());
  const transact = useCallback(async (fn: (j: Journal) => Journal): Promise<Journal> => {
    const run = () => {
      if (volatile.current) throw new Error('Локальное хранилище недоступно. Скачайте резервную копию перед закрытием страницы.');
      const loaded = readDurable(localStorage);
      const next = fn(loaded.journal);
      // Persist the queue before updating the screen or submitting a request.
      const encoded = JSON.stringify(next);
      if (localStorage.getItem(journalKey) !== encoded) localStorage.setItem(journalKey, encoded);
      loaded.operations.forEach(key => localStorage.removeItem(key));
      current.current = next;
      setJournal(next);
      const legacy = JSON.stringify({ version: 3, data: next.state });
      if (localStorage.getItem(legacyKey) !== legacy) localStorage.setItem(legacyKey, legacy);
      setError('');
      return next;
    };
    try {
      if (navigator.locks) return await navigator.locks.request('hogwarts-progress', run);
      const result = serial.current.then(run);
      serial.current = result.then(() => {}, () => {});
      return await result;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не удалось сохранить изменения в браузере.');
      throw e;
    }
  }, []);
  const setState = useCallback((action: SetStateAction<LessonState>) => {
    if (access.current?.readOnly && access.current.user === readSession()?.user.id) return;
    const state = typeof action === 'function' ? action(current.current.state) : action;
    try {
      if (volatile.current) throw new Error('Storage unavailable');
      current.current = writeOperation(localStorage, current.current, state);
      setJournal(current.current);
      void transact(j => j).catch(() => {});
    } catch {
      volatile.current = true;
      current.current = { ...current.current, state };
      setJournal(current.current);
      setError('Прогресс не удалось сохранить в браузере. Оставьте страницу открытой и скачайте резервную копию.');
    }
  }, [transact]);
  const sync = useCallback(async () => {
    const session = readSession();
    if (!cloudConfigured || !session || !navigator.onLine || busy.current) return;
    busy.current = true;
    const user = session.user.id;
    const isCurrent = () => readSession()?.user.id === user;
    try {
      setPhase('reading');
      const read = async () => syncProgress({ p_changes: {}, p_import: null });
      if (access.current?.user !== user || access.current.readOnly) {
        const result = await read();
        if (!isCurrent()) return;
        if (result.read_only) {
          access.current = { user, readOnly: true };
          setTeacher({ user, learner: result.user_id, state: expand(Object.fromEntries(
            Object.entries(result.fields).map(([key, field]) => [key, field.value]))) });
          setConfirmed(user);
          setSyncError('');
          setPhase('idle');
          return;
        }
        if (result.user_id !== user) throw new Error('Supabase вернул данные другой учётной записи.');
        access.current = { user, readOnly: false };
        setTeacher(undefined);
      }
      const snapshot = await transact(j => {
        const bound = bind(j, user);
        return { ...bound, inFlight: bound.inFlight ?? bound.pending };
      });
      if (!isCurrent()) return;
      const sent = snapshot.inFlight ?? {};
      const writing = !!snapshot.migration || Object.keys(sent).length > 0;
      setPhase(writing ? 'writing' : 'reading');
      const result = await syncProgress({ p_changes: sent, p_import: snapshot.migration });
      if (!isCurrent()) return;
      if (result.user_id !== snapshot.owner || result.read_only) throw new Error('Supabase вернул данные другой учётной записи.');
      await transact(j => {
        if (j.owner !== snapshot.owner || !isCurrent()) return j;
        const sameRequest = JSON.stringify(j.inFlight ?? {}) === JSON.stringify(sent);
        return {
          ...reconcile(j, result.fields, sent, snapshot.migration?.id),
          inFlight: sameRequest ? undefined : j.inFlight,
        };
      });
      if (!isCurrent()) return;
      if (snapshot.migration) setImportSkipped(result.import_skipped);
      setConfirmed(user);
      setSyncError('');
      setPhase('idle');
    } catch (e) {
      if (isCurrent()) {
        setSyncError(e instanceof Error ? e.message : 'Изменения сохранены в этом браузере.');
        setPhase('error');
      }
    } finally { busy.current = false; }
  }, [transact]);
  useEffect(() => {
    const refresh = () => {
      setOnline(navigator.onLine);
      void sync();
    };
    const visible = () => { if (document.visibilityState === 'visible') refresh(); };
    const storage = (event: StorageEvent) => {
      if (volatile.current || (event.key !== journalKey && !event.key?.startsWith('hogwarts-outbox:'))) return;
      try { const next = readJournal(); current.current = next; setJournal(next); } catch (e) { setError(String(e)); }
    };
    const auth = supabase?.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user.id);
    });
    void transact(j => j).catch(() => {});
    const timer = window.setInterval(refresh, 5000);
    window.addEventListener('online', refresh);
    window.addEventListener('offline', refresh);
    window.addEventListener('focus', refresh);
    window.addEventListener('storage', storage);
    document.addEventListener('visibilitychange', visible);
    return () => {
      clearInterval(timer);
      auth?.data.subscription.unsubscribe();
      window.removeEventListener('online', refresh);
      window.removeEventListener('offline', refresh);
      window.removeEventListener('focus', refresh);
      window.removeEventListener('storage', storage);
      document.removeEventListener('visibilitychange', visible);
    };
  }, [sync, transact]);
  useEffect(() => { if (userId) void sync(); }, [sync, userId]);
  const targetId = teacher?.user === userId ? teacher?.learner : userId;
  useEffect(() => {
    if (!targetId || !supabase) return;
    const channel = supabase.channel('lesson-progress:' + targetId)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'lesson_progress', filter: 'user_id=eq.' + targetId },
        () => void sync())
      .subscribe(status => { if (status === 'SUBSCRIBED') void sync(); });
    return () => { void supabase?.removeChannel(channel); };
  }, [sync, targetId]);
  const pending = JSON.stringify(journal.pending);
  const hasPending = Object.keys(journal.pending).length > 0 || !!journal.migration;
  // A follow-up is needed when a new edit arrived while the previous RPC was in flight.
  useEffect(() => {
    if (!userId || phase !== 'idle' || !Object.keys(current.current.pending).length) return;
    const timer = setTimeout(() => void sync(), 600);
    return () => clearTimeout(timer);
  }, [phase, pending, sync, userId]);
  const teacherState = teacher?.user === userId ? teacher?.state : undefined;
  const status = error ? 'Sync error' : !online ? 'Offline' :
    phase === 'error' ? 'Sync error' :
    phase === 'writing' || (!teacherState && hasPending) ? 'Saving...' :
    confirmed !== userId || !confirmed ? 'Syncing...' : 'Saved';
  return { state: teacherState ?? journal.state, setState, error, status, syncError, sync, journal, importSkipped };
}
