import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join, extname, normalize } from 'node:path';
import plantumlEncoder from 'plantuml-encoder';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT ?? 3000);
const PLANTUML_URL = process.env.PLANTUML_URL ?? 'http://localhost:8080';

const pkg = JSON.parse(await readFile(join(__dirname, 'package.json'), 'utf8'));
const VERSION_INFO = {
  version: pkg.version,
  buildSha: process.env.BUILD_SHA ?? 'dev',
  buildTime: process.env.BUILD_TIME ?? new Date().toISOString(),
};

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.js':   'application/javascript; charset=utf-8',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
};

const PUBLIC_DIR = join(__dirname, 'public');

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);

    if (req.method === 'POST' && url.pathname === '/render') {
      return await handleRender(req, res);
    }

    if (req.method === 'GET' && url.pathname === '/version') {
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      return res.end(JSON.stringify(VERSION_INFO));
    }

    if (req.method === 'GET') {
      return await handleStatic(url.pathname, res);
    }

    res.writeHead(405).end('Method not allowed');
  } catch (err) {
    console.error(err);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: err.message }));
  }
});

async function handleRender(req, res) {
  const body = await readBody(req);
  const { source } = JSON.parse(body);

  if (typeof source !== 'string' || source.trim() === '') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ svg: '', error: null, line: null }));
    return;
  }

  const encoded = plantumlEncoder.encode(source);
  const upstream = await fetch(`${PLANTUML_URL}/svg/${encoded}`);
  const svg = await upstream.text();

  const error = upstream.headers.get('x-plantuml-diagram-error');
  const lineHeader = upstream.headers.get('x-plantuml-diagram-error-line');
  const line = lineHeader ? Number(lineHeader) : null;

  res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify({ svg, error, line }));
}

async function handleStatic(pathname, res) {
  const safePath = normalize(pathname).replace(/^(\.\.[/\\])+/, '');
  const relPath = safePath === '/' || safePath === '\\' ? '/index.html' : safePath;
  const filePath = join(PUBLIC_DIR, relPath);

  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403).end('Forbidden');
    return;
  }

  try {
    const data = await readFile(filePath);
    const type = MIME[extname(filePath)] ?? 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': type });
    res.end(data);
  } catch {
    res.writeHead(404).end('Not found');
  }
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.setEncoding('utf8');
    req.on('data', (chunk) => { data += chunk; });
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
}

server.listen(PORT, () => {
  console.log(`pug.checker v${VERSION_INFO.version} (${VERSION_INFO.buildSha}) läuft auf http://localhost:${PORT}`);
  console.log(`PlantUML-Server: ${PLANTUML_URL}`);
});
