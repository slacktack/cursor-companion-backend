import { createHash, randomInt } from 'node:crypto';
import { redis } from '../lib/store.js';
import { json, bad, checkName, readBody } from '../lib/common.js';

// Pairing: every install has a secret uid and a public 6-char code.
const ALPHA = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const UID = /^[A-Za-z0-9-]{16,64}$/;
const CODE = /^[A-Z0-9]{6}$/;
const PALS = new Set(['tushar', 'bae', 'cinnamoroll', 'hellokitty']);
const uk = (uid) => `pl:user:${uid}`;
const ck = (code) => `pl:code:${code}`;

const newCode = () => Array.from({ length: 6 }, () => ALPHA[randomInt(ALPHA.length)]).join('');
const roomFor = (a, b) => 'r' + createHash('sha256').update([a, b].sort().join(':')).digest('hex').slice(0, 24);

async function getUser(uid) {
  const [raw] = await redis(['GET', uk(uid)]);
  try { return raw ? JSON.parse(raw) : null; } catch { return null; }
}
const putUser = (uid, u) => ['SET', uk(uid), JSON.stringify(u)];

async function profile(uid, u) {
  if (!u) return null;
  let partner = null;
  if (u.partnerUid) {
    const p = await getUser(u.partnerUid);
    if (p && p.partnerUid === uid) partner = { name: p.name, code: p.code, pal: p.pal || 'bae' };
  }
  return { code: u.code, name: u.name, pal: u.pal, paired: !!partner, room: partner ? roomFor(uid, u.partnerUid) : null, partner };
}

export async function GET(req) {
  const uid = new URL(req.url).searchParams.get('uid');
  if (!UID.test(uid || '')) return bad('bad uid');
  const u = await getUser(uid);
  if (!u) return json({ ok: false, error: 'unknown' }, 404);
  return json({ ok: true, me: await profile(uid, u) });
}

export async function POST(req) {
  let b;
  try { b = await readBody(req, 4000); } catch { return bad('bad body'); }
  const { action, uid } = b;
  if (!UID.test(uid || '')) return bad('bad uid');
  let u = await getUser(uid);

  if (action === 'hello') {
    const name = String(b.name || '').trim();
    if (!checkName(name)) return bad('pick a name (1–24 letters)');
    const pal = PALS.has(b.pal) ? b.pal : u?.pal || 'tushar';
    if (!u) {
      let code;
      for (let i = 0; i < 8 && !code; i++) {
        const c = newCode();
        const [ok] = await redis(['SET', ck(c), uid, 'NX']);
        if (ok === 'OK') code = c;
      }
      if (!code) return json({ ok: false, error: 'try again' }, 503);
      u = { code, name, pal, partnerUid: null, at: Date.now() };
    } else {
      u.name = name;
      u.pal = pal;
    }
    await redis(putUser(uid, u));
    return json({ ok: true, me: await profile(uid, u) });
  }

  if (!u) return json({ ok: false, error: 'unknown' }, 404);

  if (action === 'pair') {
    const code = String(b.code || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (!CODE.test(code)) return bad('codes are 6 letters/numbers');
    if (code === u.code) return bad("that's your own code 😄");
    const [pid] = await redis(['GET', ck(code)]);
    if (!pid) return json({ ok: false, error: 'no one has that code' }, 404);
    const p = await getUser(pid);
    if (!p) return json({ ok: false, error: 'no one has that code' }, 404);
    if (p.name.toLowerCase() === u.name.toLowerCase()) return bad('you both have the same name — change yours first');
    // Pairing replaces any previous partner on both sides.
    const cmds = [];
    for (const [a, other] of [[u, uid], [p, pid]]) {
      if (a.partnerUid && a.partnerUid !== (a === u ? pid : uid)) {
        const old = await getUser(a.partnerUid);
        if (old && old.partnerUid === other) { old.partnerUid = null; cmds.push(putUser(a.partnerUid, old)); }
      }
    }
    u.partnerUid = pid;
    p.partnerUid = uid;
    cmds.push(putUser(uid, u), putUser(pid, p));
    await redis(...cmds);
    return json({ ok: true, me: await profile(uid, u) });
  }

  if (action === 'unpair') {
    const cmds = [];
    if (u.partnerUid) {
      const p = await getUser(u.partnerUid);
      if (p && p.partnerUid === uid) { p.partnerUid = null; cmds.push(putUser(u.partnerUid, p)); }
    }
    u.partnerUid = null;
    cmds.push(putUser(uid, u));
    await redis(...cmds);
    return json({ ok: true, me: await profile(uid, u) });
  }

  return bad('bad action');
}
