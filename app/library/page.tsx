import { readdir, stat } from "fs/promises"
import path from "path"
import Link from "next/link"
import { ArrowLeft, File, Folder, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { loadSettings } from "@/lib/settings"
import { format } from "date-fns"

// Function to get directory contents
async function getDirectoryContents(directoryPath: string) {
  try {
    // Read all files and directories
    const items = await readdir(directoryPath)

    // Process each item to determine if it's a file or directory
    const itemsWithDetails = await Promise.all(
      items.map(async (item) => {
        const itemPath = path.join(directoryPath, item)
        const itemStat = await stat(itemPath)

        return {
          name: item,
          path: itemPath,
          isDirectory: itemStat.isDirectory(),
          isPDF: item.toLowerCase().endsWith(".pdf") && itemStat.isFile(),
          size: itemStat.size,
          modified: itemStat.mtime,
        }
      }),
    )

    // Sort directories first, then files
    return itemsWithDetails.sort((a, b) => {
      if (a.isDirectory && !b.isDirectory) return -1
      if (!a.isDirectory && b.isDirectory) return 1
      return a.name.localeCompare(b.name)
    })
  } catch (error) {
    console.error("Error reading directory:", error)
    return []
  }
}

// Function to check if a path is within the configured directory
function isWithinConfiguredDirectory(configuredDir: string, targetPath: string) {
  const relativePath = path.relative(configuredDir, targetPath)
  return !relativePath.startsWith("..") && !path.isAbsolute(relativePath)
}

// Function to format file size
function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes"
  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}

export default async function Library({ searchParams }: { searchParams: { path?: string } }) {
  // Get the configured directory from settings
  const settings = loadSettings()
  const configuredDirectory = settings.pdfDirectory

  // Get the current directory path from query parameters or use the configured directory
  let currentDirectory = configuredDirectory

  // First await the entire searchParams object
  const resolvedSearchParams = await Promise.resolve(searchParams)
  // Then safely access the path property
  const pathParam = resolvedSearchParams && typeof resolvedSearchParams === 'object' ? 
    resolvedSearchParams.path : 
    undefined

  if (pathParam) {
    const requestedPath = decodeURIComponent(pathParam)
    // Only allow navigation to paths within the configured directory
    if (isWithinConfiguredDirectory(configuredDirectory, requestedPath)) {
      currentDirectory = requestedPath
    }
  }

  // Get directory contents
  const contents = await getDirectoryContents(currentDirectory)

  // Separate directories and PDF files
  const directories = contents.filter((item) => item.isDirectory)
  const files = contents.filter((item) => !item.isDirectory && item.isPDF) // Only show PDF files

  // Determine parent directory for the back button
  let parentDirectory = null
  if (currentDirectory !== configuredDirectory) {
    parentDirectory = path.dirname(currentDirectory)
  }

  return (
    <main className="container mx-auto px-4 py-6">
      <div className="flex items-center mb-4">
      <Link href="/">
          <Button variant="outline" size="icon" className="mr-2">
            <Home className="h-5 w-5" />
          </Button>
        </Link>

        {parentDirectory ? (
          <Link href={`/library?path=${encodeURIComponent(parentDirectory)}`}>
            <Button variant="outline" size="icon" className="mr-2">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
        ) : (
          <Button variant="outline" size="icon" className="mr-2" disabled>
            <ArrowLeft className="h-5 w-5 text-muted-foreground" />
          </Button>
        )}               
        
        <h1 className="text-2xl font-bold">Penjelajah Berkas</h1>
      </div>

      {contents.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground mb-4">Direktori ini kosong.</p>
        </div>
      ) : directories.length === 0 && files.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground mb-4">Tidak ada folder atau file PDF di direktori ini.</p>
        </div>
      ) : files.length === 0 ? (
        <div>
          <div className="border border-border rounded-md overflow-hidden">
            {/* Table header */}
            <div className="grid grid-cols-12 bg-muted py-2 px-3 border-b border-border text-sm font-medium">
              <div className="col-span-6">Nama</div>
              <div className="col-span-2">Jenis</div>
              <div className="col-span-2">Ukuran</div>
              <div className="col-span-2">Diubah</div>
            </div>

            {/* Directory items */}
            {directories.map((dir) => (
              <Link
                key={dir.path}
                href={`/library?path=${encodeURIComponent(dir.path)}`}
                className="grid grid-cols-12 py-3 px-3 hover:bg-accent border-b border-border text-sm items-center"
              >
                <div className="col-span-6 flex items-center">
                  <Folder className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span className="truncate">{dir.name}</span>
                </div>
                <div className="col-span-2">Folder</div>
                <div className="col-span-2">-</div>
                <div className="col-span-2">{format(dir.modified, "dd/MM/yyyy")}</div>
              </Link>
            ))}
          </div>
          <div className="text-center py-4">
            <p className="text-muted-foreground">Tidak ada file PDF di direktori ini.</p>
          </div>
        </div>
      ) : (
        <div className="border border-border rounded-md overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-12 bg-muted py-2 px-3 border-b border-border text-sm font-medium">
            <div className="col-span-6">Nama</div>
            <div className="col-span-2">Jenis</div>
            <div className="col-span-2">Ukuran</div>
            <div className="col-span-2">Diubah</div>
          </div>

          {/* Directory items */}
          {directories.map((dir) => (
            <Link
              key={dir.path}
              href={`/library?path=${encodeURIComponent(dir.path)}`}
              className="grid grid-cols-12 py-3 px-3 hover:bg-accent border-b border-border text-sm items-center"
            >
              <div className="col-span-6 flex items-center">
                <Folder className="h-4 w-4 mr-2 flex-shrink-0" />
                <span className="truncate">{dir.name}</span>
              </div>
              <div className="col-span-2">Folder</div>
              <div className="col-span-2">-</div>
              <div className="col-span-2">{format(dir.modified, "dd/MM/yyyy")}</div>
            </Link>
          ))}

          {/* File items */}
          {files.map((file) => (
            <Link
              key={file.path}
              href={`/reader/${encodeURIComponent(file.path)}`}
              className="grid grid-cols-12 py-3 px-3 hover:bg-accent border-b border-border text-sm items-center"
            >
              <div className="col-span-6 flex items-center">
                <File className="h-4 w-4 mr-2 flex-shrink-0" />
                <span className="truncate">{file.name}</span>
              </div>
              <div className="col-span-2">PDF</div>
              <div className="col-span-2">{formatFileSize(file.size)}</div>
              <div className="col-span-2">{format(file.modified, "dd/MM/yyyy")}</div>
            </Link>
          ))}
        </div>
      )}
    </main>
  )
}
