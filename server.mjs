import http from 'node:http'
import { readFile } from 'node:fs/promises'
import { extname, join, normalize } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const __dirname = normalize(join(fileURLToPath(import.meta.url), '..'))
const rootDir = __dirname

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
  const cleaned = urlPath.split('?')[0].split('#')[0]
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
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' })
      res.end('404 Not Found')
      return
    }

    const ext = extname(filePath)
    const contentType = mimeByExt[ext] || 'application/octet-stream'
    res.writeHead(200, { 'Content-Type': contentType })
    res.end(data)
  } catch {
    res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' })
    res.end('500 Server Error')
  }
}

export default async function handler(req, res) {
  return handle(req, res)
}

const isEntrypoint = import.meta.url === pathToFileURL(process.argv[1] || '').href
if (isEntrypoint) {
  const server = http.createServer((req, res) => {
    void handle(req, res)
  })
  const PORT = process.env.PORT || 3000
  server.listen(Number(PORT), '0.0.0.0', () => {
    process.stdout.write(`Servidor listo: http://localhost:${PORT}/\n`)
  })
}
