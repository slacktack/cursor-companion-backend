import { redis } from '../lib/store.js';
import { json, bad, checkRoom, checkName, k, presence } from '../lib/common.js';

// Drains my inbox (unless busy), marks me online and reports my partner's presence.
export async function GET(req) {
  try { return await get(req); } catch (e) { return json({ ok: false, error: e.message }, 500); }
}

async function get(req) {
  const q = new URL(req.url).searchParams;
  const room = q.get('room'), me = q.get('me'), partner = q.get('partner');
  if (!checkRoom(room) || !checkName(me) || !checkName(partner)) return bad('bad room or names');
  const now = Date.now();
  const away = q.get('away') === '1';
  const busy = q.get('status') === 'busy';
  const cmds = [['GET', k.seen(room, partner)], ['GET', k.status(room, partner)]];
  cmds.push(busy ? ['SET', k.status(room, me), 'busy', 'EX', 2 * 86400] : ['DEL', k.status(room, me)]);
  if (!away) cmds.push(['SET', k.seen(room, me), now, 'EX', 7 * 86400]);
  if (!busy) cmds.push(['LPOP', k.inbox(room, me), 50]);
  const r = await redis(...cmds);
  const items = busy ? null : r[r.length - 1];
  const events = (items || []).map((s) => { try { return JSON.parse(s); } catch { return null; } }).filter(Boolean);
  return json({ ok: true, now, events, held: busy, partner: presence(r[0], r[1], now) });
}
