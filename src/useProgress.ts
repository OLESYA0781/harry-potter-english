import { useCallback, useEffect, useRef, useState } from 'react';
import type { SetStateAction } from 'react';
import { initial } from './data';
import type { LessonState } from './data';
import { bind, journalKey, legacyKey, loadLegacy, newJournal, readLegacy, reconcile } from './progress';
import type { Journal } from './progress';
import { readDurable, writeOperation } from './progressStorage';
import { readSession, supabase, syncProgress } from './supabase';

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
  const [actor, setActor] = useState(() => readSession()?.user.id);
  const [owner, setOwner] = useState<string>();
  const [online, setOnline] = useState(() => navigator.onLine);
  const [status, setStatus] = useState<'Saving...' | 'Saved' | 'Syncing...' | 'Sync error'>('Syncing...');
  const [syncError, setSyncError] = useState('');
  const access = useRef<{ actor: string; owner: string } | undefined>(undefined);
  const [importSkipped, setImportSkipped] = useState(0);
  const busy = useRef(false);
  const requested = useRef(false);
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
      // The journal is authoritative. Failure to refresh the compatibility
      // copy must not prevent sending edits already persisted in the journal.
      try {
        const legacy = JSON.stringify({ version: 3, data: next.state });
        const previousLegacy = localStorage.getItem(legacyKey);
        if (previousLegacy !== legacy && (previousLegacy === null || readLegacy(localStorage))) {
          localStorage.setItem(legacyKey, legacy);
        }
      } catch { /* The durable version is already saved. */ }
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
    if (!supabase || !navigator.onLine || !readSession()) return;
    if (busy.current) { requested.current = true; return; }
    busy.current = true;
    const session = readSession()!;
    const actor = session.user.id;
    try {
      if (access.current?.actor !== actor) {
        setStatus('Syncing...');
        const result = await syncProgress({ p_changes: {}, p_import: null, p_actor: actor, p_owner: null });
        if (readSession()?.user.id !== actor) return;
        access.current = { actor, owner: result.user_id };
      }
      const learner = access.current.owner;
      const snapshot = await transact(j => readSession()?.user.id === actor ? bind(j, learner, actor) : j);
      if (snapshot.owner !== learner || readSession()?.user.id !== actor) return;
      setOwner(learner);
      let more = true;
      while (more && navigator.onLine && readSession()?.user.id === actor) {
        const local = await transact(j => {
          if (j.flight) return j;
          if (!Object.keys(j.pending).length && !j.migration) return j;
          // Keep the exact in-flight batch until we know its outcome, including
          // across reloads and while the user continues typing.
          return { ...j, flight: { id: crypto.randomUUID(), changes: j.pending, migration: j.migration } };
        });
        const flight = local.flight;
        if (flight) setStatus('Saving...');
        const result = await syncProgress({
          p_changes: flight?.changes ?? {}, p_import: flight?.migration ?? null, p_actor: actor, p_owner: learner,
        });
        if (result.user_id !== learner || readSession()?.user.id !== actor) return;
        const confirmed = await transact(j => {
          if (j.owner !== learner || readSession()?.user.id !== actor) return j;
          // Another tab can have completed this batch and advanced revisions.
          if (j.flight?.id !== flight?.id) return j;
          return { ...reconcile(j, result.fields, flight?.changes ?? {}, flight?.migration?.id), flight: undefined };
        });
        if (flight?.migration) setImportSkipped(result.import_skipped);
        more = Object.keys(confirmed.pending).length > 0;
        if (more && flight && Object.entries(confirmed.pending).every(([key, change]) =>
          flight.changes[key]?.mutation === change.mutation && flight.changes[key]?.base === change.base)) {
          throw new Error('Сервер не подтвердил изменения. Черновики сохранены в этом браузере.');
        }
        setStatus(more ? 'Saving...' : 'Saved');
        setSyncError('');
      }
    } catch (e) {
      if (readSession()?.user.id === actor) {
        setSyncError(e instanceof Error ? e.message : 'Синхронизация недоступна.');
        setStatus('Sync error');
      }
    } finally {
      busy.current = false;
      if (requested.current) {
        requested.current = false;
        // Coalesce auth, focus and Realtime notifications received mid-request.
        queueMicrotask(() => void sync());
      }
    }
  }, [transact]);
  useEffect(() => {
    const refresh = (event: Event) => {
      setOnline(navigator.onLine);
      if (event.type === 'online' || document.visibilityState === 'visible') void sync();
    };
    const onStorage = (event: StorageEvent) => {
      if (volatile.current || event.key !== journalKey) return;
      try { current.current = readJournal(); setJournal(current.current); } catch (e) { setError(String(e)); }
    };
    const onAuth = supabase?.auth.onAuthStateChange((_event, session) => {
      const id = session?.user.id;
      if (access.current?.actor !== id) {
        access.current = undefined;
        setOwner(undefined);
        setStatus('Syncing...');
        setSyncError('');
      }
      setActor(id);
      // Supabase dispatches this callback while it holds the auth lock.
      if (id) void setTimeout(() => void sync(), 0);
    });
    void transact(j => j).catch(() => {});
    const timer = supabase && window.setInterval(() => void sync(), 5000);
    window.addEventListener('online', refresh);
    window.addEventListener('offline', refresh);
    window.addEventListener('focus', refresh);
    document.addEventListener('visibilitychange', refresh);
    window.addEventListener('storage', onStorage);
    return () => {
      if (timer) clearInterval(timer);
      onAuth?.data.subscription.unsubscribe();
      window.removeEventListener('online', refresh);
      window.removeEventListener('offline', refresh);
      window.removeEventListener('focus', refresh);
      document.removeEventListener('visibilitychange', refresh);
      window.removeEventListener('storage', onStorage);
    };
  }, [sync, transact]);
  useEffect(() => {
    if (!supabase || !actor || !owner) return;
    const client = supabase;
    const channel = client.channel(`lesson-progress:${owner}`)
      .on('postgres_changes', {
        event: 'UPDATE', schema: 'public', table: 'lesson_progress', filter: `user_id=eq.${owner}`,
      }, () => void sync())
      .subscribe(state => { if (state === 'SUBSCRIBED') void sync(); });
    return () => { void client.removeChannel(channel); };
  }, [actor, owner, sync]);
  const pending = Object.keys(journal.pending);
  const pendingToken = JSON.stringify(journal.pending);
  useEffect(() => {
    if (!actor) return;
    const timer = setTimeout(() => void sync(), 600);
    return () => clearTimeout(timer);
  }, [pendingToken, actor, sync]);
  const visibleStatus = error ? 'Sync error' : !online ? 'Offline' :
    pending.length && status === 'Saved' ? 'Saving...' : status;
  return { owner, state: journal.state, setState, error, status: visibleStatus, syncError, sync, journal, importSkipped };
}
