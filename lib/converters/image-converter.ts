// Client-side image conversion using browser APIs
export async function convertImage(file: File, targetFormat: string): Promise<{ data: string; filename: string }> {
  return new Promise((resolve, reject) => {
    try {
      const reader = new FileReader()
      reader.onload = (event) => {
        const img = new Image()
        img.onload = () => {
          const canvas = document.createElement("canvas")
          canvas.width = img.width
          canvas.height = img.height

          const ctx = canvas.getContext("2d")
          if (!ctx) {
            reject(new Error("Could not get canvas context"))
            return
          }

          ctx.drawImage(img, 0, 0)

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
            case "webp":
              mimeType = "image/webp"
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
        }

        img.onerror = () => {
          reject(new Error("Failed to load image"))
        }

        img.src = event.target?.result as string
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
