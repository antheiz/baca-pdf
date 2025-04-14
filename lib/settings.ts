import fs from "fs"
import path from "path"
import { networkInterfaces } from "os"
import { homedir } from "os"

// Path to the settings file
const settingsPath = path.join(process.cwd(), "settings.json")

// Get the local IP address
export function getLocalIpAddress() {
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

  return results[0] || "localhost"
}

// Load settings from file
export function loadSettings() {
  try {
    if (fs.existsSync(settingsPath)) {
      const data = fs.readFileSync(settingsPath, "utf8")
      return JSON.parse(data)
    }
  } catch (error) {
    console.error("Error loading settings:", error)
  }

  // Default settings with $HOME
  const userHome = homedir()
  return {
    pdfDirectory: process.env.PDF_DIRECTORY || path.join(userHome, "Documents"),
    port: process.env.PORT || "3000",
    serverAddress: getLocalIpAddress(),
  }
}

// Save settings to file
export function saveSettings(settings) {
  try {
    fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2))
    return true
  } catch (error) {
    console.error("Error saving settings:", error)
    return false
  }
}
