// Client-side audio conversion using Web Audio API
export async function convertAudio(file: File, targetFormat: string): Promise<{ data: string; filename: string }> {
  return new Promise((resolve, reject) => {
    try {
      const reader = new FileReader()

      reader.onload = async (event) => {
        try {
          const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
          const audioData = event.target?.result as ArrayBuffer

          // Decode the audio data
          audioContext.decodeAudioData(
            audioData,
            async (buffer) => {
              try {
                // Create a media stream from the audio buffer
                const offlineContext = new OfflineAudioContext(
                  buffer.numberOfChannels,
                  buffer.length,
                  buffer.sampleRate,
                )

                const source = offlineContext.createBufferSource()
                source.buffer = buffer
                source.connect(offlineContext.destination)
                source.start(0)

                // Render the audio
                const renderedBuffer = await offlineContext.startRendering()

                // Convert to the desired format
                const mediaStreamDestination = audioContext.createMediaStreamDestination()
                const mediaRecorder = new MediaRecorder(mediaStreamDestination.stream, {
                  mimeType: getMimeType(targetFormat),
                })

                const chunks: Blob[] = []
                mediaRecorder.ondataavailable = (e) => {
                  if (e.data.size > 0) {
                    chunks.push(e.data)
                  }
                }

                mediaRecorder.onstop = () => {
                  const blob = new Blob(chunks, { type: getMimeType(targetFormat) })
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
                mediaRecorder.start()

                // Create a source node from the rendered buffer
                const sourceNode = audioContext.createBufferSource()
                sourceNode.buffer = renderedBuffer
                sourceNode.connect(mediaStreamDestination)
                sourceNode.start(0)

                // Stop recording after the duration of the audio
                setTimeout(() => {
                  mediaRecorder.stop()
                  sourceNode.stop()
                }, renderedBuffer.duration * 1000)
              } catch (error) {
                reject(error)
              }
            },
            (error) => {
              reject(new Error("Failed to decode audio data"))
            },
          )
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
    case "mp3":
      return "audio/mpeg"
    case "wav":
      return "audio/wav"
    case "ogg":
      return "audio/ogg"
    case "aac":
      return "audio/aac"
    default:
      return "audio/mpeg"
  }
}
