import http from 'http';
import fs from 'fs';
import path from 'path';

const PORT = 8090;
const PUBLIC_DIR = path.resolve('public');

const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.js': 'text/javascript; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf'
};

const server = http.createServer((req, res) => {
  const urlPath = req.url.split('?')[0];

  // Block access to src/ or tests/
  if (urlPath.startsWith('/src') || urlPath.startsWith('/tests') || urlPath.startsWith('/bin') || urlPath.startsWith('/db')) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    return res.end('404 Not Found');
  }

  if (urlPath === '/api/v1/snapshot') {
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      res.writeHead(405, { 'Content-Type': 'text/plain' });
      return res.end('405 Method Not Allowed');
    }
    const snapPath = path.join(PUBLIC_DIR, 'data', 'snapshot.json');
    if (fs.existsSync(snapPath)) {
      const etag = '"v146-' + new Date().toISOString().slice(0, 10).replace(/-/g, '') + '"';
      if (req.headers['if-none-match'] === etag) {
        res.writeHead(304, { ETag: etag });
        return res.end();
      }
      res.writeHead(200, {
        'Content-Type': 'application/json; charset=UTF-8',
        'Cache-Control': 'public, max-age=60',
        'ETag': etag
      });
      return fs.createReadStream(snapPath).pipe(res);
    }
    res.writeHead(404);
    return res.end(JSON.stringify({ error: 'Snapshot not found' }));
  }

  if (urlPath === '/api/v1/search-log') {
    const contentType = req.headers['content-type'] || '';
    if (!contentType.includes('application/json')) {
      res.writeHead(415, { 'Content-Type': 'text/plain' });
      return res.end('415 Unsupported Media Type');
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ ok: true }));
  }

  if (urlPath.startsWith('/api/')) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    return res.end('404 Not Found');
  }

  let filePath = path.join(PUBLIC_DIR, urlPath === '/' ? 'index.html' : urlPath);
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, 'index.html');
  }

  if (!fs.existsSync(filePath)) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    return res.end('404 Not Found');
  }

  const ext = path.extname(filePath).toLowerCase();
  const mimeType = MIME_TYPES[ext] || 'application/octet-stream';

  res.writeHead(200, { 'Content-Type': mimeType });
  fs.createReadStream(filePath).pipe(res);
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Local dev server running at http://localhost:${PORT}`);
});
