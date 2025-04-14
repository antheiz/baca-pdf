import Link from "next/link"
import { FolderOpen, Settings } from "lucide-react"

export default function Home() {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Pembaca PDF</h1>
      <p className="mb-8 text-muted-foreground">
        Selamat datang di pembaca PDF minimalis. Jelajahi koleksi Anda di bawah ini.
      </p>

      <div className="grid gap-4">
        <Link
          href="/library"
          className="flex items-center p-4 border border-border rounded-lg hover:bg-accent transition-colors"
        >
          <FolderOpen className="mr-2 h-5 w-5" />
          <span>Telusuri Berkas</span>
        </Link>

        <Link
          href="/settings"
          className="flex items-center p-4 border border-border rounded-lg hover:bg-accent transition-colors"
        >
          <Settings className="mr-2 h-5 w-5" />
          <span>Pengaturan</span>
        </Link>
      </div>

      <div className="mt-8 p-4 bg-muted rounded-lg">
        <h2 className="text-lg font-medium mb-2">Mulai Cepat</h2>
        <p className="text-sm text-muted-foreground mb-2">
          Klik "Telusuri Berkas" untuk menjelajahi direktori dan membuka file PDF.
        </p>
        <p className="text-sm text-muted-foreground">
          Gunakan halaman Pengaturan untuk mengkonfigurasi direktori default dan pengaturan server.
        </p>
      </div>
    </main>
  )
}
