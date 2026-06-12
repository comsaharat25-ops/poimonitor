// Minimal static server for local browser preview of index.html. Run: node server.js  → http://localhost:8099
const http = require('http');
const fs = require('fs');
const path = require('path');
const port = 8099;
http.createServer((req, res) => {
  let f = decodeURIComponent(req.url.split('?')[0]);
  if (f === '/' || f === '') f = '/index.html';
  const fp = path.join(__dirname, f);
  fs.readFile(fp, (err, data) => {
    if (err) { res.writeHead(404); res.end('not found'); return; }
    const ext = path.extname(fp);
    const ct = ext === '.html' ? 'text/html' : ext === '.js' ? 'text/javascript' : 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': ct });
    res.end(data);
  });
}).listen(port, () => console.log('serving on http://localhost:' + port));
