import { ModeToggle } from "@/components/mode-toggle"
import { ConverterSection } from "@/components/converter-section"
import { Button } from "@/components/ui/button"
import {
  FileIcon,
  ImageIcon,
  FileAudioIcon,
  FileVideoIcon,
  FileTextIcon,
  CloudIcon,
  ZapIcon,
  DownloadIcon,
} from "lucide-react"
import Link from "next/link"

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <FileIcon className="h-6 w-6" />
            <h1 className="text-xl font-bold">Allinoneconverter.io</h1>
          </div>
          <ModeToggle />
        </div>
      </header>

      <main className="container py-10">
        <section className="space-y-6 pb-8 pt-6 md:pb-12 md:pt-10 lg:py-16">
          <div className="flex max-w-[980px] flex-col items-start gap-2">
            <h1 className="text-3xl font-extrabold leading-tight tracking-tighter md:text-4xl lg:text-5xl">
              All-in-One File Conversion Tool
            </h1>
            <p className="max-w-[700px] text-lg text-muted-foreground md:text-xl">
              Convert between various file formats with ease. Fast, secure, and free to use.
            </p>
            <div className="flex flex-wrap gap-2 mt-2">
              <div className="flex items-center text-sm text-muted-foreground">
                <ZapIcon className="h-4 w-4 mr-1" />
                <span>100% Browser-based</span>
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <CloudIcon className="h-4 w-4 mr-1" />
                <span>Works Offline</span>
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <DownloadIcon className="h-4 w-4 mr-1" />
                <span>Installable PWA</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="#image-converters">
              <Button size="lg">Get Started</Button>
            </Link>
            <Button variant="outline" size="lg">
              Learn More
            </Button>
          </div>
        </section>

        <div id="image-converters">
          <ConverterSection
            title="Image Converters"
            icon={<ImageIcon className="h-6 w-6" />}
            converters={[
              { name: "JPG to PNG", description: "Convert JPG images to PNG format" },
              { name: "PNG to JPG", description: "Convert PNG images to JPG format" },
              { name: "PDF to JPG", description: "Extract images from PDF files" },
              { name: "JPG to PDF", description: "Convert JPG images to PDF documents" },
              { name: "PNG to PDF", description: "Convert PNG images to PDF documents" },
              { name: "PDF to PNG", description: "Extract images from PDF as PNG" },
              { name: "WebP to PNG", description: "Convert WebP images to PNG format" },
              { name: "PNG to WebP", description: "Convert PNG images to WebP format" },
              { name: "JPG to WebP", description: "Convert JPG images to WebP format" },
              { name: "WebP to JPG", description: "Convert WebP images to JPG format" },
            ]}
          />
        </div>

        <ConverterSection
          title="Document Converters"
          icon={<FileTextIcon className="h-6 w-6" />}
          converters={[
            { name: "DOCX to PDF", description: "Convert Word documents to PDF format" },
            { name: "PDF to DOCX", description: "Convert PDF files to editable Word documents" },
            { name: "PPTX to PDF", description: "Convert PowerPoint presentations to PDF" },
            { name: "PDF to PPTX", description: "Convert PDF files to PowerPoint presentations" },
            { name: "XLSX to PDF", description: "Convert Excel spreadsheets to PDF" },
            { name: "PDF to XLSX", description: "Convert PDF files to Excel spreadsheets" },
          ]}
        />

        <ConverterSection
          title="Video Converters"
          icon={<FileVideoIcon className="h-6 w-6" />}
          converters={[
            { name: "MP4 to AVI", description: "Convert MP4 videos to AVI format" },
            { name: "AVI to MP4", description: "Convert AVI videos to MP4 format" },
            { name: "MP4 to MOV", description: "Convert MP4 videos to MOV format" },
            { name: "MOV to MP4", description: "Convert MOV videos to MP4 format" },
            { name: "MP4 to GIF", description: "Convert MP4 videos to animated GIFs" },
            { name: "WebM to MP4", description: "Convert WebM videos to MP4 format" },
          ]}
        />

        <ConverterSection
          title="Audio Converters"
          icon={<FileAudioIcon className="h-6 w-6" />}
          converters={[
            { name: "MP3 to WAV", description: "Convert MP3 audio to WAV format" },
            { name: "WAV to MP3", description: "Convert WAV audio to MP3 format" },
            { name: "MP3 to AAC", description: "Convert MP3 audio to AAC format" },
            { name: "AAC to MP3", description: "Convert AAC audio to MP3 format" },
            { name: "MP3 to FLAC", description: "Convert MP3 audio to FLAC format" },
            { name: "FLAC to MP3", description: "Convert FLAC audio to MP3 format" },
          ]}
        />
      </main>

      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            © {new Date().getFullYear()} Allinoneconverter.io. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/Arunnpuram/Allinoneconverter.io"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm hover:underline"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-github"
              >
                <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                <path d="M9 18c-4.51 2-5-2-7-2" />
              </svg>
              GitHub Repository
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
