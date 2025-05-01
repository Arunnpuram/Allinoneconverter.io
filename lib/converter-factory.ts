import { convertImage } from "./converters/image-converter"
import { convertToPdf, convertFromPdf } from "./converters/pdf-converter"
import { convertAudio } from "./converters/audio-converter"
import { convertVideo } from "./converters/video-converter"
import { convertDocument } from "./converters/document-converter"

export async function convertFile(
  file: File,
  sourceFormat: string,
  targetFormat: string,
): Promise<{ data: string; filename: string }> {
  // Normalize formats to lowercase for consistent comparison
  const source = sourceFormat.toLowerCase()
  const target = targetFormat.toLowerCase()

  // Define format groups for easier checking
  const imageFormats = ["jpg", "jpeg", "png", "webp"]
  const documentFormats = ["pdf", "docx"]
  const audioFormats = ["mp3", "wav", "aac"]
  const videoFormats = ["mp4", "webm"]

  // Image to image conversion
  if (imageFormats.includes(source) && imageFormats.includes(target)) {
    return convertImage(file, target)
  }

  // PDF to image conversion
  if (source === "pdf" && imageFormats.includes(target)) {
    return convertFromPdf(file, target)
  }

  // Image to PDF conversion
  if (imageFormats.includes(source) && target === "pdf") {
    return convertToPdf(file, source)
  }

  // Document conversions
  if ((source === "docx" && target === "pdf") || (source === "pdf" && target === "docx")) {
    return convertDocument(file, source, target)
  }

  // Audio conversions
  if (audioFormats.includes(source) && audioFormats.includes(target)) {
    return convertAudio(file, target)
  }

  // Video conversions
  if (videoFormats.includes(source) && videoFormats.includes(target)) {
    return convertVideo(file, target)
  }

  throw new Error(`Conversion from ${sourceFormat} to ${targetFormat} is not supported`)
}
