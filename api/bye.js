import { redis } from '../lib/store.js';
import { json, bad, checkRoom, checkName, k, readBody, ONLINE_MS } from '../lib/common.js';

// Marks me offline right away (app quit / tab hidden).
export async function POST(req) {
  try { return await post(req); } catch (e) { return json({ ok: false, error: e.message }, 500); }
}

async function post(req) {
  let b;
  try { b = await readBody(req, 2000); } catch { return bad('bad body'); }
  if (!checkRoom(b.room) || !checkName(b.from)) return bad('bad room or names');
  await redis(['SET', k.seen(b.room, b.from), Date.now() - ONLINE_MS - 1, 'EX', 7 * 86400]);
  return json({ ok: true });
}
