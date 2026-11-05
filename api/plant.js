import { redis } from '../lib/store.js';
import { json, bad, checkRoom, checkName, k, id, readBody } from '../lib/common.js';
import { fresh, upgrade, water, pick, touch, view, dayKey } from '../lib/plant.js';
import { FLOWERS, byId } from '../lib/flowers.js';

async function load(room, now) {
  const [raw, boops, love] = await redis(['GET', k.plant(room)], ['GET', k.boops(room)], ['GET', k.love(room, dayKey(now))]);
  let state;
  try { state = raw ? JSON.parse(raw) : null; } catch { state = null; }
  return { state: state ? upgrade(state) : fresh(), boops: Number(boops || 0), love: Number(love || 0) };
}

function event(from, data, now) {
  return JSON.stringify({ id: `${now.toString(36)}${Math.random().toString(36).slice(2, 6)}`, kind: 'plant', from: String(from).trim(), at: now, data });
}

const push = (room, to, ev) => [['RPUSH', k.inbox(room, to), ev], ['LTRIM', k.inbox(room, to), -60, -1], ['EXPIRE', k.inbox(room, to), 3 * 86400]];

export async function GET(req) {
  try { return await get(req); } catch (e) { return json({ ok: false, error: e.message }, 500); }
}

async function get(req) {
  const q = new URL(req.url).searchParams;
  const room = q.get('room'), me = q.get('me'), partner = q.get('partner');
  if (!checkRoom(room) || !checkName(me) || !checkName(partner)) return bad('bad room or names');
  const now = Date.now();
  const { state, boops, love } = await load(room, now);
  // Love from boops/notes can tip it into bloom between waterings.
  if (touch(state, id(me), id(partner), love, now)) {
    const f = byId[state.garden.at(-1).flower];
    await redis(['SET', k.plant(room), JSON.stringify(state)], ...push(room, partner, event(me, { action: 'bloom', flower: f.id, name: f.name }, now)));
  }
  return json({ ok: true, plant: view(state, id(me), id(partner), love, now), boops, flowers: q.get('catalog') ? FLOWERS : undefined });
}

export async function POST(req) {
  try { return await post(req); } catch (e) { return json({ ok: false, error: e.message }, 500); }
}

async function post(req) {
  let b;
  try { b = await readBody(req, 4000); } catch { return bad('bad body'); }
  const { room, from, to, action = 'water', flower } = b;
  if (!checkRoom(room) || !checkName(from) || !checkName(to)) return bad('bad room or names');
  const now = Date.now();
  const { state, boops, love } = await load(room, now);
  const me = id(from), partner = id(to);
  let res, data;
  if (action === 'pick') {
    res = pick(state, me, partner, flower, love, now);
    if (!res.error) data = { action: 'pick', flower, name: byId[flower].name, agreed: res.agreed };
  } else {
    res = water(state, me, partner, love, now);
    if (!res.error) {
      const v = view(state, me, partner, love, now);
      data = { action: 'water', flower: v.flower, name: byId[v.flower]?.name, stage: v.stage, stageName: v.stageName, grew: res.grew, bloomed: res.bloomed };
    }
  }
  if (res.error) return json({ ok: false, error: res.error, plant: view(state, me, partner, love, now), boops }, 409);
  await redis(['SET', k.plant(room), JSON.stringify(state)], ...push(room, to, event(from, data, now)));
  return json({ ok: true, ...res, plant: view(state, me, partner, love, now), boops });
}
