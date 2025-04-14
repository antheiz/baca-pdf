import { type NextRequest, NextResponse } from "next/server"
import fs from "fs"
import path from "path"
import { loadSettings } from "@/lib/settings"

export async function GET(request: NextRequest, { params }: { params: { filename: string } }) {
  try {
    const filename = decodeURIComponent(params.filename as string)
    const settings = loadSettings()

    // Check if the filename is a full path or just a filename
    const pdfPath = filename.includes("/") ? filename : path.join(settings.pdfDirectory, filename)

    // Check if file exists
    try {
      const stats = fs.statSync(pdfPath)
      if (!stats.isFile()) {
        return NextResponse.json({ message: "Not a file" }, { status: 404 })
      }
    } catch (error) {
      return NextResponse.json({ message: "File not found" }, { status: 404 })
    }

    // Read the file
    const pdfBuffer = fs.readFileSync(pdfPath)

    // Return the PDF file
    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${path.basename(filename)}"`,
      },
    })
  } catch (error) {
    console.error("Error serving PDF:", error)
    return NextResponse.json({ message: "Error serving PDF" }, { status: 500 })
  }
}
