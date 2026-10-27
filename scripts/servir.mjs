import fs from 'node:fs'
import http from 'node:http'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const raiz = path.dirname(fileURLToPath(import.meta.url))
const dist = path.resolve(raiz, '..', 'dist')
const puerto = Number(process.env.PORT) || 3000

const tipos = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.wasm': 'application/wasm',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.woff2': 'font/woff2',
}

function archivoSeguro(pedido) {
  const limpio = decodeURIComponent(pedido.split('?')[0])
  const destino = path.resolve(dist, '.' + limpio)
  const relativo = path.relative(dist, destino)
  if (relativo.startsWith('..') || path.isAbsolute(relativo)) return null
  return destino
}

const servidor = http.createServer((req, res) => {
  const pedido = req.url ?? '/'
  let archivo = archivoSeguro(pedido)
  if (!archivo) {
    res.writeHead(400)
    res.end()
    return
  }
  if (fs.existsSync(archivo) && fs.statSync(archivo).isDirectory()) {
    archivo = path.join(archivo, 'index.html')
  }
  if (!fs.existsSync(archivo) || fs.statSync(archivo).isDirectory()) {
    archivo = path.join(dist, 'index.html')
  }
  if (!fs.existsSync(archivo)) {
    res.writeHead(404)
    res.end('Falta dist. Ejecuta npm run build.')
    return
  }
  const tipo = tipos[path.extname(archivo).toLowerCase()] ?? 'application/octet-stream'
  res.writeHead(200, { 'Content-Type': tipo })
  fs.createReadStream(archivo).pipe(res)
})

servidor.listen(puerto, '0.0.0.0', () => {
  console.log(`Servidor corriendo en el puerto ${puerto}`)
})
