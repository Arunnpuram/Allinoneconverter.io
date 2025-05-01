// Client-side video conversion using Web APIs
export async function convertVideo(file: File, targetFormat: string): Promise<{ data: string; filename: string }> {
  return new Promise((resolve, reject) => {
    try {
      const reader = new FileReader()

      reader.onload = async (event) => {
        try {
          // Create a video element to load the source
          const video = document.createElement("video")
          video.autoplay = false
          video.muted = true
          video.loop = false
          video.controls = false

          // Set up the video source
          const sourceUrl = URL.createObjectURL(file)
          video.src = sourceUrl

          video.onloadedmetadata = () => {
            try {
              // Create a canvas to capture frames
              const canvas = document.createElement("canvas")
              canvas.width = video.videoWidth
              canvas.height = video.videoHeight
              const ctx = canvas.getContext("2d")

              if (!ctx) {
                reject(new Error("Could not get canvas context"))
                return
              }

              // Create a media recorder to capture the output
              const stream = canvas.captureStream(30) // 30 FPS

              // Add audio track if available
              video.oncanplay = () => {
                try {
                  if (video.captureStream) {
                    const videoStream = video.captureStream()
                    const audioTracks = videoStream.getAudioTracks()
                    if (audioTracks.length > 0) {
                      stream.addTrack(audioTracks[0])
                    }
                  }

                  // Set up media recorder
                  const mimeType = getMimeType(targetFormat)
                  const mediaRecorder = new MediaRecorder(stream, {
                    mimeType: mimeType,
                    videoBitsPerSecond: 2500000, // 2.5 Mbps
                  })

                  const chunks: Blob[] = []
                  mediaRecorder.ondataavailable = (e) => {
                    if (e.data.size > 0) {
                      chunks.push(e.data)
                    }
                  }

                  mediaRecorder.onstop = () => {
                    // Clean up
                    URL.revokeObjectURL(sourceUrl)

                    // Create the output blob
                    const blob = new Blob(chunks, { type: mimeType })
                    const url = URL.createObjectURL(blob)

                    // Get original filename without extension
                    const originalName = file.name.split(".")[0]
                    const newFilename = `${originalName}.${targetFormat}`

                    resolve({
                      data: url,
                      filename: newFilename,
                    })
                  }

                  // Start recording
                  mediaRecorder.start(100) // Capture in 100ms chunks

                  // Start the video
                  video.play()

                  // Draw frames to the canvas
                  const drawFrame = () => {
                    if (video.paused || video.ended) {
                      mediaRecorder.stop()
                      return
                    }

                    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
                    requestAnimationFrame(drawFrame)
                  }

                  drawFrame()

                  // Stop after the video duration
                  setTimeout(
                    () => {
                      if (mediaRecorder.state !== "inactive") {
                        mediaRecorder.stop()
                      }
                    },
                    video.duration * 1000 + 500,
                  ) // Add a small buffer
                } catch (error) {
                  reject(error)
                }
              }
            } catch (error) {
              reject(error)
            }
          }

          video.onerror = () => {
            reject(new Error("Failed to load video"))
          }
        } catch (error) {
          reject(error)
        }
      }

      reader.onerror = () => {
        reject(new Error("Failed to read file"))
      }

      reader.readAsArrayBuffer(file)
    } catch (error) {
      reject(error)
    }
  })
}

function getMimeType(format: string): string {
  switch (format.toLowerCase()) {
    case "mp4":
      return "video/mp4"
    case "webm":
      return "video/webm"
    case "ogg":
      return "video/ogg"
    default:
      return "video/mp4"
  }
}
