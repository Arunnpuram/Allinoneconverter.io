import { type NextRequest, NextResponse } from "next/server"
import sharp from "sharp"
import { PDFDocument } from "pdf-lib"
import { promises as fs } from "fs"
import path from "path"
import os from "os"
import { exec } from "child_process"
import util from "util"

const execPromise = util.promisify(exec)

// Helper function to convert stream to buffer
async function streamToBuffer(stream: ReadableStream): Promise<Buffer> {
  const reader = stream.getReader()
  const chunks: Uint8Array[] = []

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    chunks.push(value)
  }

  return Buffer.concat(chunks)
}

// Helper function to create a temporary file
async function createTempFile(buffer: Buffer, extension: string): Promise<string> {
  const tempDir = os.tmpdir()
  const tempFilePath = path.join(tempDir, `temp-${Date.now()}.${extension}`)
  await fs.writeFile(tempFilePath, buffer)
  return tempFilePath
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const converterType = formData.get("converterType") as string

    if (!file || !converterType) {
      return NextResponse.json({ error: "File and converter type are required" }, { status: 400 })
    }

    const fileBuffer = Buffer.from(await file.arrayBuffer())
    const [sourceFormat, targetFormat] = converterType.split("-to-")

    let resultBuffer: Buffer | null = null
    let resultType = ""

    // Image conversions
    if (
      (sourceFormat === "jpg" && targetFormat === "png") ||
      (sourceFormat === "png" && targetFormat === "jpg") ||
      (sourceFormat === "webp" && targetFormat === "png") ||
      (sourceFormat === "png" && targetFormat === "webp") ||
      (sourceFormat === "jpg" && targetFormat === "webp") ||
      (sourceFormat === "webp" && targetFormat === "jpg")
    ) {
      const sharpInstance = sharp(fileBuffer)

      if (targetFormat === "png") {
        resultBuffer = await sharpInstance.png().toBuffer()
        resultType = "image/png"
      } else if (targetFormat === "jpg" || targetFormat === "jpeg") {
        resultBuffer = await sharpInstance.jpeg().toBuffer()
        resultType = "image/jpeg"
      } else if (targetFormat === "webp") {
        resultBuffer = await sharpInstance.webp().toBuffer()
        resultType = "image/webp"
      }
    }

    // PDF to image conversions
    else if (sourceFormat === "pdf" && (targetFormat === "jpg" || targetFormat === "png")) {
      // For PDF to image, we'll use sharp with the first page
      // In a real app, you might want to extract all pages
      const pdfDoc = await PDFDocument.load(fileBuffer)
      const pages = pdfDoc.getPageCount()

      if (pages > 0) {
        // This is a simplified version - in a real app you'd use pdf.js or another library
        // to properly render PDF pages to images
        const tempFilePath = await createTempFile(fileBuffer, "pdf")
        const outputPath = tempFilePath.replace(".pdf", `.${targetFormat}`)

        // Use ImageMagick or another tool in a real implementation
        // This is just a placeholder
        await execPromise(`convert -density 300 -quality 100 ${tempFilePath}[0] ${outputPath}`)

        resultBuffer = await fs.readFile(outputPath)
        resultType = targetFormat === "jpg" ? "image/jpeg" : "image/png"

        // Clean up temp files
        await fs.unlink(tempFilePath)
        await fs.unlink(outputPath)
      }
    }

    // Image to PDF conversion
    else if ((sourceFormat === "jpg" || sourceFormat === "png") && targetFormat === "pdf") {
      const pdfDoc = await PDFDocument.create()
      const image = await pdfDoc.embedJpg(fileBuffer)

      const page = pdfDoc.addPage()
      const { width, height } = image.scale(1)

      page.drawImage(image, {
        x: 0,
        y: 0,
        width: page.getWidth(),
        height: page.getHeight(),
        opacity: 1,
      })

      resultBuffer = Buffer.from(await pdfDoc.save())
      resultType = "application/pdf"
    }

    // Document conversions (simplified - in a real app you'd use more robust libraries)
    else if (
      (sourceFormat === "docx" && targetFormat === "pdf") ||
      (sourceFormat === "pdf" && targetFormat === "docx")
    ) {
      // This is a placeholder - in a real app you'd use libraries like docx-pdf, pdf-parse, etc.
      // For demo purposes, we'll just return a sample file
      resultBuffer = fileBuffer // In a real app, this would be the converted file
      resultType =
        targetFormat === "pdf"
          ? "application/pdf"
          : "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    }

    // Video conversions (simplified - in a real app you'd use ffmpeg)
    else if (
      (sourceFormat === "mp4" && targetFormat === "avi") ||
      (sourceFormat === "avi" && targetFormat === "mp4") ||
      (sourceFormat === "mp4" && targetFormat === "mov") ||
      (sourceFormat === "mov" && targetFormat === "mp4")
    ) {
      // This is a placeholder - in a real app you'd use ffmpeg
      // For demo purposes, we'll just return a sample file
      resultBuffer = fileBuffer // In a real app, this would be the converted file
      resultType = targetFormat === "mp4" ? "video/mp4" : targetFormat === "avi" ? "video/x-msvideo" : "video/quicktime"
    }

    // Audio conversions (simplified - in a real app you'd use ffmpeg)
    else if (
      (sourceFormat === "mp3" && targetFormat === "wav") ||
      (sourceFormat === "wav" && targetFormat === "mp3") ||
      (sourceFormat === "mp3" && targetFormat === "aac") ||
      (sourceFormat === "aac" && targetFormat === "mp3")
    ) {
      // This is a placeholder - in a real app you'd use ffmpeg
      // For demo purposes, we'll just return a sample file
      resultBuffer = fileBuffer // In a real app, this would be the converted file
      resultType = targetFormat === "mp3" ? "audio/mpeg" : targetFormat === "wav" ? "audio/wav" : "audio/aac"
    }

    if (!resultBuffer) {
      return NextResponse.json({ error: "Conversion not supported" }, { status: 400 })
    }

    // Generate a filename for the converted file
    const originalName = file.name.split(".")[0]
    const newFilename = `${originalName}.${targetFormat}`

    // Return the converted file
    return new NextResponse(resultBuffer, {
      headers: {
        "Content-Type": resultType,
        "Content-Disposition": `attachment; filename="${newFilename}"`,
      },
    })
  } catch (error) {
    console.error("Conversion error:", error)
    return NextResponse.json({ error: "Conversion failed" }, { status: 500 })
  }
}
