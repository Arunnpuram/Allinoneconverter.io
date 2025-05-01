import { notFound } from "next/navigation"
import { FileUploader } from "@/components/file-uploader"
import { Button } from "@/components/ui/button"
import { ArrowLeftIcon } from "lucide-react"
import Link from "next/link"
import { ModeToggle } from "@/components/mode-toggle"

// This is a placeholder for demonstration purposes
// In a real app, you would have a database or configuration of supported converters
const supportedConverters = [
  "jpg-to-png",
  "png-to-jpg",
  "pdf-to-jpg",
  "jpg-to-pdf",
  "png-to-pdf",
  "pdf-to-png",
  "docx-to-pdf",
  "pdf-to-docx",
  "mp4-to-avi",
  "avi-to-mp4",
  "mp4-to-mov",
  "mov-to-mp4",
  "mp3-to-wav",
  "wav-to-mp3",
  "mp3-to-aac",
  "aac-to-mp3",
  "mp3-to-flac",
  "flac-to-mp3",
  "webp-to-png",
  "png-to-webp",
  "jpg-to-webp",
  "webp-to-jpg",
  // Add all other converters here
]

export default function ConverterPage({ params }: { params: { converter: string } }) {
  const { converter } = params

  if (!supportedConverters.includes(converter)) {
    notFound()
  }

  // Format the converter name for display
  const formattedName = converter
    .split("-")
    .map((part) => part.toUpperCase())
    .join(" to ")

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/">
              <Button variant="ghost" size="icon">
                <ArrowLeftIcon className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="ml-2 text-xl font-bold">{formattedName} Converter</h1>
          </div>
          <ModeToggle />
        </div>
      </header>

      <main className="container py-10">
        <div className="max-w-3xl mx-auto">
          <FileUploader converterType={converter} />
        </div>
      </main>
    </div>
  )
}
