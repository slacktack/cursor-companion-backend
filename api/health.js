import { redis, usingMemory } from '../lib/store.js';
import { json } from '../lib/common.js';

export async function GET() {
  if (usingMemory) return json({ ok: !process.env.VERCEL, store: 'memory', note: process.env.VERCEL ? 'Redis env vars missing — connect Upstash Redis and redeploy' : 'local dev' }, process.env.VERCEL ? 500 : 200);
  try {
    const [pong] = await redis(['SET', 'pl:health', Date.now(), 'EX', 60]);
    return json({ ok: pong === 'OK', store: 'redis' });
  } catch (e) {
    return json({ ok: false, store: 'redis', error: e.message }, 500);
  }
}
