import { loadEnv } from 'vite';
import { spawnSync } from 'node:child_process';

const env = { ...loadEnv('production', process.cwd(), 'VITE_'), ...process.env };
let validUrl = false;
try {
  const url = new URL(env.VITE_SUPABASE_URL || '');
  validUrl = url.protocol === 'https:' && !url.username && !url.password &&
    !url.search && !url.hash && !/YOUR_PROJECT|REPLACE|localhost/i.test(url.href);
} catch { /* Never print configuration values. */ }
const key = env.VITE_SUPABASE_PUBLISHABLE_KEY || '';
let publicKey = key.startsWith('sb_publishable_') && key.length > 25;
if (key.split('.').length === 3) {
  try { publicKey = JSON.parse(Buffer.from(key.split('.')[1], 'base64url')).role === 'anon'; }
  catch { publicKey = false; }
}
if (!validUrl || !publicKey || /REPLACE|YOUR_|example/i.test(key)) {
  console.error('Pages build stopped: set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY from the existing Supabase project. Only publishable/anon keys are allowed.');
  process.exit(1);
}
const result = spawnSync('npm', ['run', 'build'], {
  stdio: 'inherit', env: { ...env, PAGES_BASE_PATH: '/harry-potter-english/' },
});
process.exit(result.status ?? 1);
