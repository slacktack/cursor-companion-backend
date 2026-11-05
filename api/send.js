import { redis } from '../lib/store.js';
import { json, bad, checkRoom, checkName, k, presence, readBody } from '../lib/common.js';
import { dayKey } from '../lib/plant.js';

const KINDS = new Set(['boop', 'visit', 'scribble', 'hug', 'voice']);
const AUDIO = /^audio\/(mp4|aac|x-m4a|m4a|webm|ogg|mpeg)(;.*)?$/;

export async function POST(req) {
  let b;
  try { b = await readBody(req, 900_000); } catch { return bad('bad body'); }
  const { room, from, to, kind, data } = b;
  if (!checkRoom(room) || !checkName(from) || !checkName(to)) return bad('bad room or names');
  if (!KINDS.has(kind)) return bad('bad kind');
  if (kind === 'visit' && String(data?.note ?? '').length > 280) return bad('note too long');
  if (kind === 'voice' && (!AUDIO.test(data?.mime || '') || typeof data?.b64 !== 'string' || !(data.secs > 0 && data.secs <= 31))) return bad('bad voice note');
  if (kind !== 'voice' && JSON.stringify(data ?? {}).length > 300_000) return bad('too big');
  const now = Date.now();
  const ev = { id: `${now.toString(36)}${Math.random().toString(36).slice(2, 7)}`, kind, from: String(from).trim(), at: now, data: data ?? {} };
  const inbox = k.inbox(room, to);
  const love = k.love(room, dayKey(now));
  const r = await redis(
    ['RPUSH', inbox, JSON.stringify(ev)],
    ['LTRIM', inbox, -60, -1],
    ['EXPIRE', inbox, 3 * 86400],
    ['GET', k.seen(room, to)],
    ['GET', k.status(room, to)],
    ['SET', k.seen(room, from), now, 'EX', 7 * 86400],
    ['INCR', love],
    ['EXPIRE', love, 3 * 86400],
    ...(kind === 'boop' ? [['INCR', k.boops(room)]] : []),
  );
  return json({ ok: true, id: ev.id, partner: presence(r[3], r[4], now), boops: kind === 'boop' ? r[8] : undefined });
}
