import { type NextRequest, NextResponse } from "next/server"
import fs from "fs"
import path from "path"
import { networkInterfaces } from "os"
import { homedir } from "os"

// Path to the settings file
const settingsPath = path.join(process.cwd(), "settings.json")

// Get the local IP address
function getLocalIpAddress() {
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
function loadSettings() {
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
function saveSettings(settings) {
  try {
    fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2))
    return true
  } catch (error) {
    console.error("Error saving settings:", error)
    return false
  }
}

// GET handler to retrieve settings
export async function GET() {
  const settings = loadSettings()
  settings.serverAddress = getLocalIpAddress()

  return NextResponse.json(settings)
}

// POST handler to update settings
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    // Validate directory exists
    if (data.pdfDirectory) {
      try {
        const stats = fs.statSync(data.pdfDirectory)
        if (!stats.isDirectory()) {
          return NextResponse.json({ message: "Jalur yang ditentukan bukan direktori" }, { status: 400 })
        }
      } catch (error) {
        return NextResponse.json({ message: "Direktori tidak ada atau tidak dapat diakses" }, { status: 400 })
      }
    }

    // Update settings
    const currentSettings = loadSettings()
    const newSettings = {
      ...currentSettings,
      pdfDirectory: data.pdfDirectory || currentSettings.pdfDirectory,
      port: data.port || currentSettings.port,
    }

    if (saveSettings(newSettings)) {
      return NextResponse.json({ message: "Pengaturan berhasil disimpan" })
    } else {
      return NextResponse.json({ message: "Gagal menyimpan pengaturan" }, { status: 500 })
    }
  } catch (error) {
    return NextResponse.json({ message: "Permintaan tidak valid" }, { status: 400 })
  }
}
