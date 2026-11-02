// Timeweb-only build entrypoint. No production deployment or database writes.
import { spawnSync } from 'node:child_process';
import { loadEnv } from 'vite';

const env = { ...loadEnv('production', process.cwd(), 'VITE_'), ...process.env };
const url = env.VITE_SUPABASE_URL || '';
const key = env.VITE_SUPABASE_PUBLISHABLE_KEY || '';
let validUrl = false;
try {
  const parsed = new URL(url);
  validUrl = parsed.protocol === 'https:' && !parsed.username && !parsed.password &&
    !parsed.search && !parsed.hash && !/YOUR_PROJECT|REPLACE|localhost/i.test(url);
} catch { /* Print variable names only, never their values. */ }
let publicKey = key.startsWith('sb_publishable_') && key.length > 25;
if (key.split('.').length === 3) {
  try {
    publicKey = JSON.parse(Buffer.from(key.split('.')[1], 'base64url')).role === 'anon';
  } catch { publicKey = false; }
}
if (!validUrl || !publicKey || /REPLACE|YOUR_|example/i.test(key)) {
  console.error('Timeweb build stopped: set VITE_SUPABASE_URL (HTTPS) and VITE_SUPABASE_PUBLISHABLE_KEY (publishable or legacy anon) from the EXISTING project. Never use service_role/secret keys.');
  process.exit(1);
}
const result = spawnSync('npm', ['run', 'build'], { stdio: 'inherit', env });
process.exit(result.status ?? 1);
