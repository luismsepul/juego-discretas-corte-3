import http from 'node:http'
import { readFile } from 'node:fs/promises'
import { extname, join, normalize, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDir = fileURLToPath(new URL('.', import.meta.url))

const mimeByExt = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8'
}

function safePath(urlPath) {
  const cleaned = String(urlPath).split('?')[0].split('#')[0]
  const normalized = normalize(cleaned).replace(/^([A-Za-z]:)?[\\/]+/, '')
  return normalized
}

function toFilePath(urlPath) {
  const p = safePath(urlPath)
  if (p === '' || p === '.') return 'index.html'
  return p
}

async function handle(req, res) {
  try {
    const urlPath = req.url || '/'
    const filePath = join(rootDir, toFilePath(urlPath))

    let data
    try {
      data = await readFile(filePath)
    } catch {
      res.statusCode = 404
      res.setHeader('Content-Type', 'text/plain; charset=utf-8')
      res.end('404 Not Found')
      return
    }

    const ext = extname(filePath)
    res.statusCode = 200
    res.setHeader('Content-Type', mimeByExt[ext] || 'application/octet-stream')
    res.end(data)
  } catch {
    res.statusCode = 500
    res.setHeader('Content-Type', 'text/plain; charset=utf-8')
    res.end('500 Server Error')
  }
}

export default async function handler(req, res) {
  return handle(req, res)
}

const entryPath = process.argv[1] ? resolve(process.argv[1]) : null
const isEntrypoint = entryPath ? fileURLToPath(import.meta.url) === entryPath : false
if (isEntrypoint) {
  const server = http.createServer((req, res) => {
    void handle(req, res)
  })
  const PORT = process.env.PORT || 3000
  server.listen(Number(PORT), '0.0.0.0', () => {
    process.stdout.write(`Servidor listo: http://localhost:${PORT}/\n`)
  })
}
