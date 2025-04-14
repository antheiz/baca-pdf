import { type NextRequest, NextResponse } from "next/server"
import fs from "fs"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const filePath = searchParams.get("path")

    if (!filePath) {
      return NextResponse.json({ message: "No file path provided" }, { status: 400 })
    }

    const decodedPath = decodeURIComponent(filePath)

    // Check if file exists
    try {
      const stats = fs.statSync(decodedPath)
      if (!stats.isFile()) {
        return NextResponse.json({ message: "Not a file" }, { status: 404 })
      }
    } catch (error) {
      return NextResponse.json({ message: "File not found" }, { status: 404 })
    }

    // Read the file
    const pdfBuffer = fs.readFileSync(decodedPath)

    // Return the PDF file
    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
      },
    })
  } catch (error) {
    console.error("Error serving PDF:", error)
    return NextResponse.json({ message: "Error serving PDF" }, { status: 500 })
  }
}
