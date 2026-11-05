// Local dev server: node dev.js  →  http://localhost:3000 (in-memory store unless KV env is set).
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';

const PORT = Number(process.env.PORT || 3000);
const root = new URL('.', import.meta.url).pathname;
const types = { '.html': 'text/html', '.js': 'text/javascript', '.png': 'image/png', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.css': 'text/css' };

http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  try {
    if (url.pathname.startsWith('/api/')) {
      const mod = await import(join(root, 'api', `${url.pathname.slice(5).replace(/[^a-z]/g, '')}.js`));
      const fn = mod[req.method];
      if (!fn) { res.writeHead(405).end(); return; }
      const chunks = [];
      for await (const c of req) chunks.push(c);
      const body = chunks.length ? Buffer.concat(chunks) : undefined;
      const out = await fn(new Request(url, { method: req.method, headers: req.headers, body }));
      res.writeHead(out.status, Object.fromEntries(out.headers));
      res.end(Buffer.from(await out.arrayBuffer()));
      return;
    }
    let p = normalize(url.pathname === '/' ? '/index.html' : url.pathname);
    if (!extname(p)) p += '.html';
    const file = await readFile(join(root, 'public', p));
    res.writeHead(200, { 'Content-Type': types[extname(p)] || 'application/octet-stream' }).end(file);
  } catch (e) {
    res.writeHead(e.code === 'ENOENT' || e.code === 'ERR_MODULE_NOT_FOUND' ? 404 : 500).end(String(e.message));
  }
}).listen(PORT, () => console.log(`pal-link dev on http://localhost:${PORT}`));
