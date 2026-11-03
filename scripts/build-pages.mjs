import { loadEnv } from 'vite';
import { spawnSync } from 'node:child_process';
import { normalizeSupabaseUrl } from '../src/supabaseConfig.js';

const env = { ...loadEnv('production', process.cwd(), 'VITE_'), ...process.env };
let validUrl = false;
try {
  const url = new URL(normalizeSupabaseUrl(env.VITE_SUPABASE_URL || ''));
  validUrl = url.protocol === 'https:' && !url.username && !url.password &&
    !url.search && !url.hash && !/YOUR_PROJECT|REPLACE|localhost/i.test(url.href);
  env.VITE_SUPABASE_URL = url.origin;
} catch { /* Never print configuration values. */ }
const key = (env.VITE_SUPABASE_PUBLISHABLE_KEY || '').trim();
env.VITE_SUPABASE_PUBLISHABLE_KEY = key;
let publicKey = key.startsWith('sb_publishable_') && key.length > 25;
if (key.split('.').length === 3) {
  try { publicKey = JSON.parse(Buffer.from(key.split('.')[1], 'base64url')).role === 'anon'; }
  catch { publicKey = false; }
}
if (!validUrl || !publicKey || /REPLACE|YOUR_|example/i.test(key)) {
  console.error('Pages build stopped: set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY from the existing Supabase project. Only publishable/anon keys are allowed.');
  process.exit(1);
}
// Read-only check in GitHub Actions: reject wrong project/key before deployment.
// Do not sign in, log credentials, or access pupil records here.
if (process.env.PAGES_VERIFY_SUPABASE === 'true') {
  try {
    const response = await fetch(`${env.VITE_SUPABASE_URL}/auth/v1/settings`, {
      headers: { apikey: key }, signal: AbortSignal.timeout(15000), redirect: 'error',
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    console.log('Supabase Auth endpoint and public API key verified (read-only).');
  } catch (error) {
    console.error(`Pages build stopped: Supabase Auth preflight failed (${error instanceof Error ? error.message : 'network error'}).`);
    process.exit(1);
  }
}
const result = spawnSync('npm', ['run', 'build'], {
  stdio: 'inherit', env: { ...env, PAGES_BASE_PATH: '/harry-potter-english/' },
});
process.exit(result.status ?? 1);
