const { createServer } = require("http")
const { parse } = require("url")
const next = require("next")
const fs = require("fs")
const path = require("path")
const { homedir } = require("os")

// Check if we're in development or production mode
const dev = process.env.NODE_ENV !== "production"
const app = next({ dev })
const handle = app.getRequestHandler()

// Try to load settings
const settings = {
  port: 3000,
}

try {
  const settingsPath = path.join(process.cwd(), "settings.json")
  if (fs.existsSync(settingsPath)) {
    const data = fs.readFileSync(settingsPath, "utf8")
    const loadedSettings = JSON.parse(data)
    settings.port = loadedSettings.port || settings.port
  }
} catch (error) {
  console.error("Error loading settings:", error)
}

// Get the port from settings or environment variable
const port = Number.parseInt(process.env.PORT || settings.port, 10)

app.prepare().then(() => {
  createServer((req, res) => {
    const parsedUrl = parse(req.url, true)
    handle(req, res, parsedUrl)
  }).listen(port, (err) => {
    if (err) throw err

    // Get local IP addresses
    const { networkInterfaces } = require("os")
    const nets = networkInterfaces()
    const results = []

    for (const name of Object.keys(nets)) {
      for (const net of nets[name]) {
        // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
        if (net.family === "IPv4" && !net.internal) {
          results.push(net.address)
        }
      }
    }

    console.log(`> Pembaca PDF sedang berjalan!`)
    console.log(`> Lokal:            http://localhost:${port}`)

    if (results.length > 0) {
      console.log(`> Di Jaringan Anda:   http://${results[0]}:${port}`)
    }
  })
})
