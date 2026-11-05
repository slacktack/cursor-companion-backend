const ROOM = /^[A-Za-z0-9_-]{6,64}$/;
const NAME = /^[\p{L}\p{N} ._-]{1,24}$/u;

export const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
      'Access-Control-Allow-Origin': '*',
    },
  });

export const bad = (msg) => json({ ok: false, error: msg }, 400);

export const id = (s) => String(s || '').trim().toLowerCase();

export function checkRoom(room) { return ROOM.test(room || ''); }
export function checkName(n) { return NAME.test(String(n || '').trim()); }

export const k = {
  inbox: (room, who) => `pl:${room}:inbox:${id(who)}`,
  seen: (room, who) => `pl:${room}:seen:${id(who)}`,
  plant: (room) => `pl:${room}:plant`,
  boops: (room) => `pl:${room}:boops`,
  love: (room, date) => `pl:${room}:love:${date}`,
  status: (room, who) => `pl:${room}:status:${id(who)}`,
};

export const ONLINE_MS = 25_000;

export async function readBody(req, limit = 300_000) {
  const text = await req.text();
  if (text.length > limit) throw new Error('too big');
  return JSON.parse(text || '{}');
}

export function presence(seenRaw, statusRaw, now = Date.now()) {
  const at = seenRaw ? Number(seenRaw) : 0;
  const busy = statusRaw === 'busy';
  return { online: !busy && !!at && now - at < ONLINE_MS, busy, lastSeen: at || null };
}
