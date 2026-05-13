import { readFile } from 'node:fs/promises'
import { extname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDir = fileURLToPath(new URL('.', import.meta.url))

const mimeByExt = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
}

export default async function handler(req, res) {
  try {
    let urlPath = req.url || '/'

    if (urlPath === '/') {
      urlPath = '/index.html'
    }

    const filePath = join(rootDir, urlPath)

    const data = await readFile(filePath)

    const ext = extname(filePath)

    res.setHeader(
      'Content-Type',
      mimeByExt[ext] || 'application/octet-stream'
    )

    res.statusCode = 200
    res.end(data)

  } catch (error) {
    res.statusCode = 404
    res.end('404 Not Found')
  }
}
