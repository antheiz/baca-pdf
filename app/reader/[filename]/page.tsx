"use client"

import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Home, Maximize } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function PDFReader() {
  const router = useRouter()
  const params = useParams()
  const filename = params.filename ? decodeURIComponent(params.filename as string) : ""
  const displayName = filename.split("/").pop() || filename

  // Function to handle fullscreen
  const handleFullscreen = () => {
    const pdfEmbed = document.getElementById("pdf-embed")
    if (pdfEmbed) {
      if (pdfEmbed.requestFullscreen) {
        pdfEmbed.requestFullscreen()
      } else if ((pdfEmbed as any).webkitRequestFullscreen) {
        /* Safari */
        ;(pdfEmbed as any).webkitRequestFullscreen()
      } else if ((pdfEmbed as any).msRequestFullscreen) {
        /* IE11 */
        ;(pdfEmbed as any).msRequestFullscreen()
      }
    }
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Simple header with minimal controls */}
      <header className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center">
          <Button variant="outline" size="icon" onClick={() => router.back()} title="Kembali">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => router.push("/")} className="ml-2" title="Beranda">
            <Home className="h-5 w-5" />
          </Button>
          <h1 className="ml-2 text-lg font-medium truncate max-w-[200px] sm:max-w-md">{displayName}</h1>
        </div>

        <Button variant="outline" size="icon" onClick={handleFullscreen} title="Layar Penuh">
          <Maximize className="h-4 w-4" />
        </Button>
      </header>

      {/* Simple PDF Embed */}
      <div className="flex-1 w-full h-full">
        <iframe
          id="pdf-embed"
          src={`/api/pdf/raw?path=${encodeURIComponent(filename)}`}
          className="pdf-embed"
          title={displayName}
          allowFullScreen
        />
      </div>
    </div>
  )
}
