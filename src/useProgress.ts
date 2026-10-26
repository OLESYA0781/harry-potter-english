import { useCallback, useEffect, useRef, useState } from 'react';
import type { SetStateAction } from 'react';
import { initial } from './data';
import type { LessonState } from './data';
import { bind, conflicts, journalKey, legacyKey, loadLegacy, newJournal, reconcile, resolve } from './progress';
import type { Fields, Journal } from './progress';
import { readDurable, writeOperation } from './progressStorage';
import { cloudConfigured, readSession, syncProgress } from './supabase';

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
  const [status, setStatus] = useState('');
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
    if (!cloudConfigured || !readSession() || busy.current) return;
    busy.current = true;
    try {
      const session = readSession()!;
      const local = await transact(j => j);
      if (!local.owner) {
        // Verify server authorization before binding an existing local lesson.
        const access = await syncProgress({ p_changes: {}, p_import: null });
        if (access.user_id !== session.user.id || readSession()?.user.id !== session.user.id) return;
      }
      const snapshot = await transact(j => bind(j, session.user.id));
      const blocked = conflicts(snapshot);
      const sent = Object.fromEntries(Object.entries(snapshot.pending).filter(([key]) => !blocked.includes(key)));
      setStatus('Синхронизация…');
      const result: { user_id: string; fields: Fields; import_skipped: number } = await syncProgress({
        p_changes: sent, p_import: snapshot.migration,
      });
      if (result.user_id !== snapshot.owner || readSession()?.user.id !== snapshot.owner) return;
      await transact(j => {
        if (j.owner !== snapshot.owner) return j;
        return reconcile(j, result.fields, sent, snapshot.migration?.id);
      });
      if (snapshot.migration) setImportSkipped(result.import_skipped);
      setStatus('Синхронизировано');
    } catch (e) {
      setStatus(e instanceof Error ? e.message : 'Сеть недоступна. Изменения сохранены в этом браузере.');
    } finally { busy.current = false; }
  }, [transact]);
  useEffect(() => {
    const onStorage = (event: Event) => {
      if (volatile.current) return;
      if (event instanceof StorageEvent && event.key !== journalKey) return;
      try { const next = readJournal(); current.current = next; setJournal(current.current); } catch (e) { setError(String(e)); }
      if (!(event instanceof StorageEvent)) void sync();
    };
    void transact(j => j).catch(() => {});
    void sync();
    const timer = window.setInterval(() => void sync(), 5000);
    window.addEventListener('online', onStorage);
    window.addEventListener('focus', onStorage);
    window.addEventListener('storage', onStorage);
    return () => {
      clearInterval(timer);
      window.removeEventListener('online', onStorage);
      window.removeEventListener('focus', onStorage);
      window.removeEventListener('storage', onStorage);
    };
  }, [sync]);
  // Debounce small edits, while retaining the durable queue immediately.
  useEffect(() => {
    if (!Object.keys(journal.pending).some(key => !conflicts(journal).includes(key))) return;
    const timer = setTimeout(() => void sync(), 600);
    return () => clearTimeout(timer);
  }, [JSON.stringify(journal.pending), sync]);
  const choose = (key: string, choice: 'local' | 'cloud') => {
    void transact(j => resolve(j, key, choice)).then(() => sync()).catch(() => {});
  };
  return { state: journal.state, setState, error, status, sync, journal, conflicts: conflicts(journal), choose, importSkipped };
}
