import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { extname, join } from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const port = Number(process.env.PORT || 4600);
const files = new Set(['index.html', 'sites-incriveis.css', 'sites-incriveis.js', 'LICENCA.md']);
const types = { '.html':'text/html; charset=utf-8', '.css':'text/css; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.md':'text/plain; charset=utf-8' };
http.createServer(async (req, res) => {
  try {
    const path = new URL(req.url, 'http://localhost').pathname;
    const file = path === '/' ? 'index.html' : path.slice(1);
    if (!files.has(file)) { res.writeHead(404).end('Não encontrado.'); return; }
    const data = await readFile(join(root, file));
    res.writeHead(200, { 'Content-Type':types[extname(file)], 'Cache-Control':'no-store' });
    res.end(data);
  } catch { res.writeHead(404).end('Não encontrado.'); }
}).listen(port, '127.0.0.1', () => console.log(`CyberTela: http://localhost:${port}`));
