// Upstash Redis over REST (no deps). Falls back to an in-memory store for local dev.
const URL_ = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

export const usingMemory = !URL_ || !TOKEN;

// Runs commands as one pipeline; returns each command's result.
export async function redis(...cmds) {
  // Memory is per-instance; on Vercel it would silently lose messages.
  if (usingMemory && process.env.VERCEL) throw new Error('Redis is not connected — add Upstash Redis to this Vercel project');
  if (usingMemory) return cmds.map(memExec);
  const r = await fetch(`${URL_}/pipeline`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(cmds.map((c) => c.map(String))),
  });
  if (!r.ok) throw new Error(`redis ${r.status}`);
  const out = await r.json();
  return out.map((x) => {
    if (x.error) throw new Error(x.error);
    return x.result;
  });
}

const mem = globalThis.__palMem || (globalThis.__palMem = new Map());

function alive(key) {
  const e = mem.get(key);
  if (e && e.exp && e.exp < Date.now()) { mem.delete(key); return undefined; }
  return e;
}

function memExec([cmd, key, ...a]) {
  const e = alive(key);
  switch (cmd.toUpperCase()) {
    case 'GET': return e ? e.v : null;
    case 'SET': {
      if (a.some((x) => String(x).toUpperCase() === 'NX') && e) return null;
      const exIdx = a.findIndex((x) => String(x).toUpperCase() === 'EX');
      mem.set(key, { v: String(a[0]), exp: exIdx >= 0 ? Date.now() + Number(a[exIdx + 1]) * 1000 : 0 });
      return 'OK';
    }
    case 'INCR': {
      const v = (e ? Number(e.v) : 0) + 1;
      mem.set(key, { v: String(v), exp: e?.exp || 0 });
      return v;
    }
    case 'RPUSH': {
      const list = e ? e.v : [];
      list.push(...a.map(String));
      mem.set(key, { v: list, exp: e?.exp || 0 });
      return list.length;
    }
    case 'LTRIM': {
      if (!e) return 'OK';
      const n = e.v.length;
      const s = Number(a[0]) < 0 ? Math.max(0, n + Number(a[0])) : Number(a[0]);
      e.v = e.v.slice(s);
      return 'OK';
    }
    case 'LPOP': {
      if (!e || !e.v.length) return null;
      const n = Number(a[0] || 1);
      const out = e.v.splice(0, n);
      return a[0] ? out : out[0];
    }
    case 'DEL': return mem.delete(key) ? 1 : 0;
    case 'EXPIRE': if (e) e.exp = Date.now() + Number(a[0]) * 1000; return e ? 1 : 0;
    default: throw new Error(`mem: unsupported ${cmd}`);
  }
}
