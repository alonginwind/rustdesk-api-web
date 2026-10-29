// Loopback-only static server for the synthetic browser test. No API proxy and
// no automatic browser opening; production credentials are never needed.
const http = require('node:http')
const fs = require('node:fs')
const path = require('node:path')
const root = path.resolve(__dirname, '../dist')
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.woff2': 'font/woff2', '.ttf': 'font/ttf' }
http.createServer((req, res) => {
  let file
  try { file = path.resolve(root, '.' + decodeURIComponent(new URL(req.url, 'http://localhost').pathname)) } catch { res.writeHead(400).end(); return }
  if (file === root) file = path.join(root, 'index.html')
  if (!file.startsWith(root + path.sep)) { res.writeHead(403).end(); return }
  if (!fs.existsSync(file) || !fs.statSync(file).isFile()) { res.writeHead(404).end(); return }
  res.setHeader('Content-Type', types[path.extname(file)] || 'application/octet-stream')
  fs.createReadStream(file).pipe(res)
}).listen(Number(process.env.UI_PORT || 18888), '127.0.0.1', () => console.log('Built frontend: http://127.0.0.1:' + (process.env.UI_PORT || 18888)))
