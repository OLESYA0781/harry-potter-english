import { useCallback, useEffect, useRef, useState } from 'react';
import type { SetStateAction } from 'react';
import { initial } from './data';
import type { LessonState } from './data';
import { bind, journalKey, legacyKey, loadLegacy, newJournal, reconcile, recordAttempts } from './progress';
import type { Fields, Journal } from './progress';
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
  const [status, setStatus] = useState('Syncing...');
  const [syncError, setSyncError] = useState('');
  const [connected, setConnected] = useState(navigator.onLine);
  const [actor, setActor] = useState(() => readSession()?.user.id);

  const [importSkipped, setImportSkipped] = useState(0);
  const busy = useRef(false);
  const rerun = useRef(false);
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
    const state = typeof action === 'function' ? action(current.current.state) : action;
    try {
      if (volatile.current) throw new Error('Storage unavailable');
      const next = writeOperation(localStorage, current.current, state);
      if (next === current.current) return;
      current.current = next;
      setJournal(next);
      if (readSession()) setStatus('Saving...');
      void transact(j => j).catch(() => {});
    } catch {
      volatile.current = true;
      current.current = { ...current.current, state };
      setJournal(current.current);
      setError('Прогресс не удалось сохранить в браузере. Оставьте страницу открытой и скачайте резервную копию.');
    }
  }, [transact]);
  const sync = useCallback(async function runSync() {
    const actorId = readSession()?.user.id;
    if (!cloudConfigured || !actorId || !navigator.onLine) return;
    if (busy.current) {
      rerun.current = true;
      return;
    }
    busy.current = true;
    try {
      const local = await transact(j => j.owner === actorId ? recordAttempts(j) : j);
      if (local.owner) bind(local, actorId, local.learner ?? actorId);
      if (readSession()?.user.id !== actorId) return;
      let snapshot = local;
      if (!local.owner) {
        setStatus('Syncing...');
        const access = await syncProgress({ p_changes: {}, p_import: null });
        if (access.actor_id !== actorId || readSession()?.user.id !== actorId) return;
        snapshot = await transact(j => {
          const bound = bind(j, actorId, access.user_id);
          // A teacher's unbound browser may contain unrelated local practice.
          if (!j.owner && actorId !== access.user_id && bound.migration) {
            bound.migration.fields = {};
          }
          return recordAttempts(bound);
        });
      }
      if (snapshot.owner !== actorId || readSession()?.user.id !== actorId) return;
      const sent = Object.fromEntries(Object.entries(snapshot.pending).map(([key, { base, value, mutation }]) =>
        [key, { base, value, mutation }]));
      if (snapshot.migration || Object.keys(sent).length) setStatus('Saving...');
      const result: { actor_id: string; user_id: string; fields: Fields; import_skipped: number } = await syncProgress({
        p_changes: sent, p_import: snapshot.migration, p_learner: snapshot.learner ?? actorId,
      });
      if (result.actor_id !== actorId || readSession()?.user.id !== actorId) return;
      const learner = snapshot.learner ?? snapshot.owner;
      if (result.user_id !== learner) throw new Error('Облачная запись ученицы изменилась. Локальный прогресс сохранён.');
      const next = await transact(j => {
        if (j.owner !== actorId || readSession()?.user.id !== actorId) return j;
        return reconcile(j, result.fields, sent, snapshot.migration?.id);
      });
      if (snapshot.migration) setImportSkipped(result.import_skipped);
      setSyncError('');
      setStatus(Object.keys(next.pending).length || next.migration ? 'Saving...' : 'Saved');
    } catch (e) {
      setStatus('Sync error');
      setSyncError(e instanceof Error ? e.message : 'Не удалось подключиться к Supabase.');
    } finally {
      busy.current = false;
      if (rerun.current) {
        rerun.current = false;
        void runSync();
      }
    }
  }, [transact]);
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (volatile.current || event.key !== journalKey) return;
      try { const next = readJournal(); current.current = next; setJournal(next); } catch (e) { setError(String(e)); }
    };
    const onOnline = () => {
      setConnected(true);
      setStatus('Syncing...');
      void sync();
    };
    const onOffline = () => setConnected(false);
    const onVisible = () => { if (document.visibilityState === 'visible') void sync(); };
    const subscription = supabase?.auth.onAuthStateChange((_event, session) => {
      setActor(session?.user.id);
    });
    void transact(j => j).catch(() => {});
    const timer = window.setInterval(() => void sync(), 5000);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    window.addEventListener('focus', onVisible);
    window.addEventListener('storage', onStorage);
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      clearInterval(timer);
      subscription?.data.subscription.unsubscribe();
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
      window.removeEventListener('focus', onVisible);
      window.removeEventListener('storage', onStorage);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [sync, transact]);
  useEffect(() => {
    if (!actor || !supabase) return;
    setStatus('Syncing...');
    void sync();
    const channel = supabase.channel('lesson-progress').on('postgres_changes', {
      event: '*', schema: 'public', table: 'lesson_progress',
    }, () => void sync()).subscribe(state => {
      if (state === 'SUBSCRIBED') void sync();
    });
    return () => { void supabase?.removeChannel(channel); };
  }, [actor, sync]);
  // Debounce small edits, while retaining the durable queue immediately.
  useEffect(() => {
    if (!actor || !Object.keys(journal.pending).length) return;
    const timer = setTimeout(() => void sync(), 600);
    return () => clearTimeout(timer);
  }, [actor, JSON.stringify(journal.pending), sync]);
  const visibleStatus = error ? 'Sync error' : !connected ? 'Offline' : !actor ? '' :
    (Object.keys(journal.pending).length || journal.migration) && status === 'Saved' ? 'Saving...' : status;
  return { state: journal.state, setState, error, status: visibleStatus, syncError, sync, journal, importSkipped };
}
