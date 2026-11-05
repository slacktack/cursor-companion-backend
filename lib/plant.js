import { FLOWERS, byId } from './flowers.js';

// A new flower every day: pick it together, grow it with water + love, bloom by night.
export const STAGES = ['Seed', 'Sprout', 'Leafy', 'Bud', 'Bloom'];
const STAGE_AT = [0, 1, 2, 3, 5];
const MAX_WATER_EACH = 2;
const WATER_COOLDOWN_MS = 30 * 60_000;
const LOVE_PER_POINT = 3;
const MAX_LOVE_POINTS = 2;

const TZ_MIN = Number(process.env.PLANT_TZ_OFFSET_MIN ?? 330);

export function dayKey(ms) {
  return new Date(ms + TZ_MIN * 60_000).toISOString().slice(0, 10);
}

export function fresh() {
  return { v: 2, days: {}, garden: [], streak: 0, lastBloom: null };
}

// Old (v1) states are replaced; nothing in them maps onto daily flowers.
export function upgrade(state) {
  return state && state.v === 2 ? state : fresh();
}

function today(state, now) {
  const d = dayKey(now);
  if (!state.days[d]) state.days[d] = { flower: null, votes: {}, water: {}, lastWater: {}, bloomed: false };
  for (const k of Object.keys(state.days)) if (k < dayKey(now - 3 * 86_400_000)) delete state.days[k];
  return state.days[d];
}

function points(day, love) {
  const water = Object.values(day.water).reduce((a, n) => a + Math.min(MAX_WATER_EACH, n), 0);
  return water + Math.min(MAX_LOVE_POINTS, Math.floor(love / LOVE_PER_POINT));
}

function stageOf(day, love, me, partner) {
  if (!day.flower) return -1;
  const p = points(day, love);
  let s = 0;
  STAGE_AT.forEach((at, i) => { if (p >= at) s = i; });
  const both = (day.water[me] || 0) > 0 && (day.water[partner] || 0) > 0;
  if (s === 4 && !both) s = 3;
  return s;
}

function settleBloom(state, day, date, love, me, partner) {
  if (day.bloomed || stageOf(day, love, me, partner) < 4) return false;
  day.bloomed = true;
  const yesterday = dayKey(Date.parse(`${date}T12:00:00Z`) - 86_400_000);
  state.streak = state.lastBloom === yesterday ? state.streak + 1 : 1;
  state.lastBloom = date;
  state.garden.push({ date, flower: day.flower });
  if (state.garden.length > 400) state.garden.splice(0, state.garden.length - 400);
  return true;
}

// Pick (or agree on) today's flower.
export function pick(state, who, partner, flowerId, love, now = Date.now()) {
  if (!byId[flowerId]) return { error: 'unknown flower' };
  const day = today(state, now);
  if (day.flower && points(day, love) > 0 && day.flower !== flowerId) return { error: 'already growing — pick again tomorrow' };
  day.votes[who] = flowerId;
  const agreed = day.votes[partner] === flowerId;
  if (agreed) day.flower = flowerId;
  else if (day.flower && day.flower !== flowerId) day.flower = null;
  return { agreed, proposed: !agreed };
}

export function water(state, who, partner, love, now = Date.now()) {
  const date = dayKey(now);
  const day = today(state, now);
  // Watering the other's proposal counts as agreeing to it.
  if (!day.flower) {
    const proposal = day.votes[partner];
    if (!proposal) return { error: 'pick a flower first' };
    day.votes[who] = proposal;
    day.flower = proposal;
  }
  const n = day.water[who] || 0;
  if (n >= MAX_WATER_EACH) return { error: 'watered enough for today 💧' };
  const wait = (day.lastWater[who] || 0) + WATER_COOLDOWN_MS - now;
  if (n > 0 && wait > 0) return { error: `let it soak — water again in ${Math.ceil(wait / 60_000)}m` };
  const before = stageOf(day, love, who, partner);
  day.water[who] = n + 1;
  day.lastWater[who] = now;
  const after = stageOf(day, love, who, partner);
  const bloomed = settleBloom(state, day, date, love, who, partner);
  return { grew: after > before, bloomed };
}

// Re-checks bloom after love points change.
export function touch(state, me, partner, love, now = Date.now()) {
  const date = dayKey(now);
  const day = state.days[date];
  return day ? settleBloom(state, day, date, love, me, partner) : false;
}

export function view(state, me, partner, love, now = Date.now()) {
  const date = dayKey(now);
  const day = state.days[date] || { flower: null, votes: {}, water: {}, lastWater: {}, bloomed: false };
  const stage = stageOf(day, love, me, partner);
  const p = points(day, love);
  const myWater = day.water[me] || 0;
  const wait = myWater > 0 && myWater < MAX_WATER_EACH ? Math.max(0, (day.lastWater[me] || 0) + WATER_COOLDOWN_MS - now) : 0;
  const yesterday = dayKey(now - 86_400_000);
  const species = new Set(state.garden.map((g) => g.flower));
  let hint;
  const mine = byId[day.votes[me]]?.name, theirs = byId[day.votes[partner]]?.name;
  if (!day.flower) hint = mine && theirs ? `you picked ${mine}, {p} picked ${theirs} — agree on one` : mine ? `waiting for {p} to agree on ${mine}` : theirs ? `{p} wants to grow ${theirs} — agree or pick another` : "pick today's flower together";
  else if (day.bloomed) hint = 'bloomed! added to your garden 💐';
  else if (!myWater) hint = 'water it to help it grow 💧';
  else if (!(day.water[partner] || 0)) hint = "needs {p}'s water to bloom";
  else if (stage < 4) hint = `${STAGE_AT[4] - p} more to bloom — water again or send love ✨`;
  return {
    date,
    flower: day.flower,
    votes: { me: day.votes[me] || null, partner: day.votes[partner] || null },
    stage,
    stageName: stage < 0 ? 'Unplanted' : STAGES[stage],
    points: p,
    bloomAt: STAGE_AT[4],
    meWater: myWater,
    partnerWater: day.water[partner] || 0,
    maxWater: MAX_WATER_EACH,
    waterWaitMin: Math.ceil(wait / 60_000),
    love,
    lovePoints: Math.min(MAX_LOVE_POINTS, Math.floor(love / LOVE_PER_POINT)),
    bloomed: day.bloomed,
    hint: hint || '',
    streak: state.lastBloom === date || state.lastBloom === yesterday ? state.streak : 0,
    garden: state.garden.slice(-60),
    collected: species.size,
    species: FLOWERS.length,
    totalBlooms: state.garden.length,
  };
}
