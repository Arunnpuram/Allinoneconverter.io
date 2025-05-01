"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { UploadIcon, DownloadIcon, AlertCircle, FileIcon } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { convertFile } from "@/lib/converter-factory"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

interface FileUploaderProps {
  converterType: string
}

export function FileUploader({ converterType }: FileUploaderProps) {
  const [files, setFiles] = useState<File[]>([])
  const [isConverting, setIsConverting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [convertedFiles, setConvertedFiles] = useState<{ data: string; filename: string }[]>([])
  const [error, setError] = useState<string | null>(null)
  const [quality, setQuality] = useState(90)
  const [preserveMetadata, setPreserveMetadata] = useState(true)
  const [compressionLevel, setCompressionLevel] = useState(5)
  const downloadLinkRef = useRef<HTMLAnchorElement>(null)
  const [isOffline, setIsOffline] = useState(false)

  // Get source and target formats from converter type
  const [sourceFormat, targetFormat] = converterType.split("-to-")

  // Check if the browser is online or offline
  useEffect(() => {
    const handleOnlineStatusChange = () => {
      setIsOffline(!navigator.onLine)
    }

    // Set initial status
    setIsOffline(!navigator.onLine)

    // Add event listeners
    window.addEventListener("online", handleOnlineStatusChange)
    window.addEventListener("offline", handleOnlineStatusChange)

    // Clean up
    return () => {
      window.removeEventListener("online", handleOnlineStatusChange)
      window.removeEventListener("offline", handleOnlineStatusChange)
    }
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const fileArray = Array.from(e.target.files)
      setFiles(fileArray)
      setConvertedFiles([])
      setProgress(0)
      setError(null)
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const fileArray = Array.from(e.dataTransfer.files)
      setFiles(fileArray)
      setConvertedFiles([])
      setProgress(0)
      setError(null)
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }

  // Memoize the file type checking function
  const canShowPreview = (format: string): boolean => {
    return ["jpg", "jpeg", "png", "webp", "gif"].includes(format.toLowerCase())
  }

  // Optimize the file conversion process with better error handling
  const handleConvert = async () => {
    if (files.length === 0) return

    setIsConverting(true)
    setProgress(0)
    setError(null)
    setConvertedFiles([])

    try {
      const results = []
      const totalFiles = files.length

      for (let i = 0; i < totalFiles; i++) {
        const file = files[i]

        // Update progress based on file index
        setProgress(Math.round((i / totalFiles) * 90))

        try {
          // Convert the file
          const result = await convertFile(file, sourceFormat, targetFormat)
          results.push(result)
        } catch (fileError) {
          console.error(`Error converting file ${file.name}:`, fileError)
          // Continue with other files instead of failing the entire batch
        }
      }

      if (results.length === 0) {
        throw new Error("No files were successfully converted")
      }

      setConvertedFiles(results)
      setProgress(100)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred")
    } finally {
      setIsConverting(false)
    }
  }

  const handleDownload = (index: number) => {
    if (convertedFiles.length <= index) return

    const { data, filename } = convertedFiles[index]

    if (downloadLinkRef.current) {
      downloadLinkRef.current.href = data
      downloadLinkRef.current.download = filename
      downloadLinkRef.current.click()
    }
  }

  const handleDownloadAll = () => {
    // For simplicity, we'll just download the first file
    // In a real app, you'd use a library like JSZip to create a zip file
    if (convertedFiles.length > 0) {
      handleDownload(0)
    }
  }

  // Determine if we can show a preview

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>
          Convert {sourceFormat.toUpperCase()} to {targetFormat.toUpperCase()}
        </CardTitle>
        <CardDescription>
          Upload your {sourceFormat.toUpperCase()} file to convert it to {targetFormat.toUpperCase()} format
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isOffline && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You are currently offline. Don't worry - all conversions happen directly in your browser without sending
              data to any server.
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload">Upload</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          <TabsContent value="upload">
            <div
              className="border-2 border-dashed rounded-lg p-10 text-center cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => document.getElementById("file-upload")?.click()}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              <input
                id="file-upload"
                type="file"
                className="hidden"
                accept={`.${sourceFormat}`}
                onChange={handleFileChange}
                multiple
              />
              <UploadIcon className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-1">
                {files.length > 0
                  ? `${files.length} file${files.length > 1 ? "s" : ""} selected`
                  : `Drag and drop your ${sourceFormat.toUpperCase()} file${files.length !== 1 ? "s" : ""} here, or click to browse`}
              </p>
              {files.length > 0 && (
                <div className="mt-2 text-xs text-muted-foreground">
                  {files.map((file, index) => (
                    <div key={index} className="flex items-center justify-center gap-1">
                      <FileIcon className="h-3 w-3" />
                      {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
          <TabsContent value="settings">
            <div className="space-y-4 p-2">
              <div className="space-y-2">
                <Label htmlFor="quality">Quality ({quality}%)</Label>
                <Slider
                  id="quality"
                  min={10}
                  max={100}
                  step={1}
                  value={[quality]}
                  onValueChange={(value) => setQuality(value[0])}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="compression">Compression Level ({compressionLevel})</Label>
                <Slider
                  id="compression"
                  min={1}
                  max={9}
                  step={1}
                  value={[compressionLevel]}
                  onValueChange={(value) => setCompressionLevel(value[0])}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="metadata" checked={preserveMetadata} onCheckedChange={setPreserveMetadata} />
                <Label htmlFor="metadata">Preserve metadata</Label>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {isConverting && (
          <div className="space-y-2">
            <p className="text-sm">Converting...</p>
            <Progress value={progress} />
          </div>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {convertedFiles.length > 0 && canShowPreview(targetFormat) && (
          <div className="mt-4">
            <p className="text-sm font-medium mb-2">Preview:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {convertedFiles.map((file, index) => (
                <div key={index} className="border rounded-md p-2">
                  <img
                    src={file.data || "/placeholder.svg"}
                    alt={`Converted file ${index + 1}`}
                    className="max-h-[200px] mx-auto object-contain"
                    loading="lazy" // Add lazy loading for better performance
                  />
                  <p className="text-xs text-center mt-2 truncate">{file.filename}</p>
                  <Button variant="outline" size="sm" className="w-full mt-2" onClick={() => handleDownload(index)}>
                    <DownloadIcon className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Hidden download link */}
        <a ref={downloadLinkRef} className="hidden" />
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => {
            setFiles([])
            setConvertedFiles([])
            setProgress(0)
            setError(null)
          }}
          disabled={files.length === 0 || isConverting}
        >
          Clear
        </Button>

        {convertedFiles.length > 0 ? (
          <Button onClick={handleDownloadAll}>
            <DownloadIcon className="mr-2 h-4 w-4" />
            Download All
          </Button>
        ) : (
          <Button onClick={handleConvert} disabled={files.length === 0 || isConverting}>
            Convert
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
