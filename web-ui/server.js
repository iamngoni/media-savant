import express from 'express'
import { createProxyMiddleware } from 'http-proxy-middleware'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const app = express()
const PORT = process.env.PORT || 80
const API_URL = process.env.API_URL || 'http://server:4001'

// Proxy /api requests to the backend
// Using pathFilter instead of app.use path to preserve the /api prefix
const apiProxy = createProxyMiddleware({
  target: API_URL,
  changeOrigin: true,
  pathFilter: '/api',
  on: {
    proxyReq: (proxyReq, req) => {
      console.log(`[Proxy] ${req.method} ${req.originalUrl} -> ${API_URL}${req.originalUrl}`)
    },
    error: (err, req, res) => {
      console.error(`[Proxy Error] ${err.message}`)
      res.status(502).json({ error: 'Proxy error', message: err.message })
    }
  }
})

app.use(apiProxy)

// Serve static files
app.use(express.static(path.join(__dirname, 'dist')))

// SPA fallback - serve index.html for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'))
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
  console.log(`API proxy target: ${API_URL}`)
})
