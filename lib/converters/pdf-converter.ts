// Client-side PDF conversion using pdf-lib and other browser APIs
import { PDFDocument } from "pdf-lib"

export async function convertToPdf(file: File, sourceFormat: string): Promise<{ data: string; filename: string }> {
  return new Promise((resolve, reject) => {
    try {
      const reader = new FileReader()

      reader.onload = async (event) => {
        try {
          const pdfDoc = await PDFDocument.create()
          const page = pdfDoc.addPage([612, 792]) // Letter size

          if (sourceFormat === "jpg" || sourceFormat === "jpeg" || sourceFormat === "png") {
            // For images, embed them in the PDF
            const img = new Image()
            img.onload = async () => {
              const canvas = document.createElement("canvas")
              canvas.width = img.width
              canvas.height = img.height

              const ctx = canvas.getContext("2d")
              if (!ctx) {
                reject(new Error("Could not get canvas context"))
                return
              }

              ctx.drawImage(img, 0, 0)

              // Convert to PNG for embedding (works better with pdf-lib)
              const pngDataUrl = canvas.toDataURL("image/png")
              const pngData = pngDataUrl.split(",")[1]

              // Embed the image in the PDF
              const pngImage = await pdfDoc.embedPng(Uint8Array.from(atob(pngData), (c) => c.charCodeAt(0)))

              // Calculate dimensions to fit the page
              const { width, height } = pngImage.scale(1)
              const pageWidth = page.getWidth()
              const pageHeight = page.getHeight()

              // Calculate scaling to fit the page while maintaining aspect ratio
              const scale = Math.min(pageWidth / width, pageHeight / height) * 0.9

              // Calculate position to center the image
              const x = (pageWidth - width * scale) / 2
              const y = (pageHeight - height * scale) / 2

              // Draw the image on the page
              page.drawImage(pngImage, {
                x,
                y,
                width: width * scale,
                height: height * scale,
              })

              // Save the PDF
              const pdfBytes = await pdfDoc.save()
              const pdfBlob = new Blob([pdfBytes], { type: "application/pdf" })
              const pdfUrl = URL.createObjectURL(pdfBlob)

              // Get original filename without extension
              const originalName = file.name.split(".")[0]
              const newFilename = `${originalName}.pdf`

              resolve({
                data: pdfUrl,
                filename: newFilename,
              })
            }

            img.onerror = () => {
              reject(new Error("Failed to load image"))
            }

            img.src = event.target?.result as string
          } else {
            reject(new Error(`Conversion from ${sourceFormat} to PDF is not supported in the browser`))
          }
        } catch (error) {
          reject(error)
        }
      }

      reader.onerror = () => {
        reject(new Error("Failed to read file"))
      }

      reader.readAsDataURL(file)
    } catch (error) {
      reject(error)
    }
  })
}

export async function convertFromPdf(file: File, targetFormat: string): Promise<{ data: string; filename: string }> {
  return new Promise((resolve, reject) => {
    try {
      if (targetFormat === "jpg" || targetFormat === "jpeg" || targetFormat === "png") {
        const reader = new FileReader()

        reader.onload = async (event) => {
          try {
            const pdfData = new Uint8Array(event.target?.result as ArrayBuffer)
            const pdfDoc = await PDFDocument.load(pdfData)

            // Get the first page
            const pages = pdfDoc.getPages()
            if (pages.length === 0) {
              reject(new Error("PDF has no pages"))
              return
            }

            const firstPage = pages[0]
            const { width, height } = firstPage.getSize()

            // Create a new PDF with just the first page
            const singlePagePdf = await PDFDocument.create()
            const [copiedPage] = await singlePagePdf.copyPages(pdfDoc, [0])
            singlePagePdf.addPage(copiedPage)

            // Convert to image using PDF.js (simplified approach)
            // In a real app, you'd use PDF.js to render the PDF to a canvas

            // For this demo, we'll create a placeholder image
            const canvas = document.createElement("canvas")
            canvas.width = width
            canvas.height = height

            const ctx = canvas.getContext("2d")
            if (!ctx) {
              reject(new Error("Could not get canvas context"))
              return
            }

            // Draw a placeholder (in a real app, you'd render the PDF here)
            ctx.fillStyle = "#ffffff"
            ctx.fillRect(0, 0, width, height)
            ctx.font = "20px Arial"
            ctx.fillStyle = "#000000"
            ctx.textAlign = "center"
            ctx.fillText("PDF Preview (Page 1)", width / 2, height / 2)

            // Get the appropriate MIME type
            let mimeType: string
            switch (targetFormat.toLowerCase()) {
              case "png":
                mimeType = "image/png"
                break
              case "jpg":
              case "jpeg":
                mimeType = "image/jpeg"
                break
              default:
                reject(new Error(`Unsupported target format: ${targetFormat}`))
                return
            }

            // Convert to the target format
            const dataUrl = canvas.toDataURL(mimeType, 0.92)

            // Get original filename without extension
            const originalName = file.name.split(".")[0]
            const newFilename = `${originalName}.${targetFormat}`

            resolve({
              data: dataUrl,
              filename: newFilename,
            })
          } catch (error) {
            reject(error)
          }
        }

        reader.onerror = () => {
          reject(new Error("Failed to read file"))
        }

        reader.readAsArrayBuffer(file)
      } else {
        reject(new Error(`Conversion from PDF to ${targetFormat} is not supported in the browser`))
      }
    } catch (error) {
      reject(error)
    }
  })
}
