"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"

export default function Settings() {
  const router = useRouter()
  const [pdfDirectory, setPdfDirectory] = useState("")
  const [serverAddress, setServerAddress] = useState("")
  const [port, setPort] = useState("3000")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Fetch current settings
    const fetchSettings = async () => {
      try {
        const response = await fetch("/api/settings")
        if (response.ok) {
          const data = await response.json()
          setPdfDirectory(data.pdfDirectory || "")
          setServerAddress(data.serverAddress || "")
          setPort(data.port || "3000")
        }
      } catch (error) {
        console.error("Failed to fetch settings:", error)
      }
    }

    fetchSettings()
  }, [])

  const saveSettings = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pdfDirectory,
          port,
        }),
      })

      if (response.ok) {
        toast({
          title: "Pengaturan disimpan",
          description: "Pengaturan Anda telah berhasil disimpan.",
        })
        router.push("/")
      } else {
        const error = await response.json()
        throw new Error(error.message || "Gagal menyimpan pengaturan")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Gagal menyimpan pengaturan",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <Button variant="outline" size="icon" onClick={() => router.back()} className="mr-2">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">Pengaturan</h1>
      </div>

      <Card className="border-border">
        <CardHeader>
          <CardTitle>Konfigurasi Pembaca PDF</CardTitle>
          <CardDescription>Konfigurasi pengaturan pembaca PDF untuk mengakses koleksi ebook Anda.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="pdfDirectory">Jalur Direktori PDF</Label>
            <Input
              id="pdfDirectory"
              placeholder="/home/[user]/Documents"
              value={pdfDirectory}
              onChange={(e) => setPdfDirectory(e.target.value)}
              className="border-border"
            />
            <p className="text-sm text-muted-foreground">Jalur absolut ke file PDF Anda pada sistem Linux Anda.</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="serverInfo">Informasi Server</Label>
            <div className="p-4 bg-muted rounded-md">
              <p className="text-sm mb-2">Server Anda berjalan di:</p>
              <code className="block p-2 bg-background border border-border rounded-md">
                http://{serverAddress || "alamat-ip-anda"}:{port}
              </code>
              <p className="text-sm mt-2 text-muted-foreground">
                Gunakan alamat ini untuk mengakses pembaca PDF dari perangkat lain di jaringan Anda.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="port">Port</Label>
            <Input
              id="port"
              placeholder="3000"
              value={port}
              onChange={(e) => setPort(e.target.value)}
              className="border-border"
            />
            <p className="text-sm text-muted-foreground">
              Port tempat server Anda akan berjalan. Default-nya adalah 3000.
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={saveSettings} disabled={isLoading}>
            {isLoading ? "Menyimpan..." : "Simpan Pengaturan"}
            {!isLoading && <Save className="ml-2 h-4 w-4" />}
          </Button>
        </CardFooter>
      </Card>
    </main>
  )
}
