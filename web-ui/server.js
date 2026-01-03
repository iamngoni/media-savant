import express from 'express'
import { createProxyMiddleware } from 'http-proxy-middleware'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const app = express()
const PORT = process.env.PORT || 80
const API_URL = process.env.API_URL || 'http://server:4001'

// Proxy /api requests to the backend
app.use('/api', createProxyMiddleware({
  target: API_URL,
  changeOrigin: true,
}))

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
