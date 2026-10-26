import { createClient } from '@supabase/supabase-js';
import type { Session } from '@supabase/supabase-js';
export type { Session };
const env = (import.meta as ImportMeta & { env: Record<string, string | undefined> }).env;
export const cloudConfigured = !!(env.VITE_SUPABASE_URL && env.VITE_SUPABASE_PUBLISHABLE_KEY);
const sessionKey = `hogwarts-auth:${env.VITE_SUPABASE_URL}`;
export const supabase = cloudConfigured ? createClient(env.VITE_SUPABASE_URL!, env.VITE_SUPABASE_PUBLISHABLE_KEY!, {
  auth: { storageKey: sessionKey, persistSession: true, autoRefreshToken: true, detectSessionInUrl: false },
  global: { fetch: (input, init) => fetch(input, { ...init, signal: AbortSignal.timeout(15000) }) },
}) : null;
export function readSession(): Session | null {
  try { return JSON.parse(localStorage.getItem(sessionKey) || 'null'); } catch { return null; }
}
export async function signIn(email: string, password: string) {
  const { data, error } = await supabase!.auth.signInWithPassword({ email, password });
  if (error) throw new Error('Не удалось войти. Проверьте email, пароль и подключение к интернету.');
  return data.session;
}
export async function signOut() {
  const { error } = await supabase!.auth.signOut({ scope: 'local' });
  if (error) throw new Error('Не удалось завершить сессию. Проверьте подключение и повторите выход.');
}
export async function syncProgress(body: { p_changes: unknown; p_import: unknown }) {
  const { data, error } = await supabase!.rpc('sync_lesson', body);
  if (error) {
    if (error.code === '42501') throw new Error('Нет доступа для этой учётной записи. Проверьте список разрешённых пользователей Supabase.');
    throw new Error(`Синхронизация недоступна (${error.code || 'ошибка сети'}). Изменения остаются в этом браузере. Проверьте вход и повторите попытку.`);
  }
  return data;
}
