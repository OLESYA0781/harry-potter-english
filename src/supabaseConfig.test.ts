import { expect, test } from 'vitest';
import { normalizeSupabaseUrl, signInErrorMessage } from './supabaseConfig.js';
test('REST API base copied from Supabase settings becomes a project origin', () => {
  for (const input of ['https://project.supabase.co', 'https://project.supabase.co/', 'https://project.supabase.co/rest/v1', '  https://project.supabase.co/rest/v1/  ']) {
    expect(normalizeSupabaseUrl(input)).toBe('https://project.supabase.co');
    expect(new URL('/auth/v1/token', normalizeSupabaseUrl(input)).href).toBe('https://project.supabase.co/auth/v1/token');
  }
});
test('unsupported endpoints and credential-bearing URLs are rejected', () => {
  for (const input of ['https://project.supabase.co/rest/v1/table', 'https://project.supabase.co/auth/v1', 'http://project.supabase.co', 'https://user:password@project.supabase.co', 'https://project.supabase.co?apikey=x', 'invalid']) expect(() => normalizeSupabaseUrl(input)).toThrow();
});
test('network/configuration errors do not blame the password', () => {
  expect(signInErrorMessage({ status: 400, code: 'invalid_credentials' })).toContain('неверный email или пароль');
  expect(signInErrorMessage({ status: 404 })).not.toContain('пароль');
  expect(signInErrorMessage({ status: 0, name: 'AuthRetryableFetchError' })).toContain('Пароль менять не нужно');
  expect(signInErrorMessage({ status: 429 })).toContain('Слишком много попыток');
});
