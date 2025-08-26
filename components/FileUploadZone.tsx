"use client"

import type React from "react"
import { useState, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Upload, X, ExternalLink, AlertCircle } from "lucide-react"
import { uploadToCloudinary, getFileIcon, formatFileSize, type UploadedFile } from "@/lib/cloudinary"

interface FileUploadZoneProps {
  files: UploadedFile[]
  onFilesChange: (files: UploadedFile[]) => void
  maxFiles?: number
  disabled?: boolean
}

export default function FileUploadZone({ files, onFilesChange, maxFiles = 10, disabled = false }: FileUploadZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [uploadingFiles, setUploadingFiles] = useState<string[]>([])
  const [uploadErrors, setUploadErrors] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      if (!disabled) {
        setIsDragOver(true)
      }
    },
    [disabled],
  )

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleFileUpload = useCallback(async (filesToUpload: File[]) => {
    if (files.length + filesToUpload.length > maxFiles) {
      setUploadErrors([`Maximum ${maxFiles} files allowed`])
      return
    }

    setUploadErrors([])
    const uploadPromises = filesToUpload.map(async (file) => {
      const uploadId = `${file.name}-${Date.now()}`

      try {
        setUploadingFiles((prev) => [...prev, uploadId])

        const uploadedFile = await uploadToCloudinary(file)

        setUploadingFiles((prev) => prev.filter((id) => id !== uploadId))
        return uploadedFile
      } catch (error) {
        setUploadingFiles((prev) => prev.filter((id) => id !== uploadId))
        setUploadErrors((prev) => [
          ...prev,
          `Failed to upload ${file.name}: ${error instanceof Error ? error.message : "Unknown error"}`,
        ])
        return null
      }
    })

    const results = await Promise.all(uploadPromises)
    const successfulUploads = results.filter((result): result is UploadedFile => result !== null)

    if (successfulUploads.length > 0) {
      onFilesChange([...files, ...successfulUploads])
    }
  }, [files, maxFiles, onFilesChange]);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragOver(false)

      if (disabled) return

      const droppedFiles = Array.from(e.dataTransfer.files)
      handleFileUpload(droppedFiles)
    },
    [disabled, handleFileUpload],
  )

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (disabled) return

      const selectedFiles = Array.from(e.target.files || [])
      handleFileUpload(selectedFiles)

      // Reset input value to allow selecting the same file again
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    },
    [disabled, handleFileUpload],
  )

  const removeFile = (fileId: string) => {
    onFilesChange(files.filter((file) => file.id !== fileId))
  }

  const openFileSelector = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  return (
    <div className="space-y-4">
      {/* Upload Zone */}
      <Card
        className={`border-2 border-dashed transition-colors cursor-pointer ${
          isDragOver
            ? "border-teal-400 bg-teal-400/10"
            : disabled
              ? "border-slate-600 bg-slate-800/30"
              : "border-slate-600 bg-slate-800/50 hover:border-slate-500"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={openFileSelector}
      >
        <CardContent className="p-8">
          <div className="text-center">
            <Upload className={`h-12 w-12 mx-auto mb-4 ${disabled ? "text-slate-500" : "text-slate-400"}`} />
            <h3 className={`text-lg font-medium mb-2 ${disabled ? "text-slate-500" : "text-white"}`}>
              {isDragOver ? "Drop files here" : "Upload files"}
            </h3>
            <p className={`text-sm mb-4 ${disabled ? "text-slate-600" : "text-slate-400"}`}>
              {disabled ? "File upload is disabled" : "Drag and drop files here, or click to select files"}
            </p>
            {!disabled && (
              <Button
                type="button"
                variant="outline"
                className="border-slate-600 text-slate-300 hover:bg-slate-700 cursor-pointer bg-transparent"
                onClick={(e) => {
                  e.stopPropagation()
                  openFileSelector()
                }}
              >
                <Upload className="h-4 w-4 mr-2" />
                Choose Files
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled}
        title="Select files to upload"
        placeholder="Choose files"
      />

      {/* Upload Errors */}
      {uploadErrors.length > 0 && (
        <div className="space-y-2">
          {uploadErrors.map((error, index) => (
            <div key={index} className="bg-red-900/20 border border-red-800 rounded-lg p-3 flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0" />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          ))}
        </div>
      )}

      {/* Uploading Files */}
      {uploadingFiles.length > 0 && (
        <div className="space-y-2">
          {uploadingFiles.map((uploadId) => (
            <div
              key={uploadId}
              className="bg-blue-900/20 border border-blue-800 rounded-lg p-3 flex items-center space-x-3"
            >
              <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin flex-shrink-0"></div>
              <p className="text-blue-400 text-sm">Uploading {uploadId.split("-")[0]}...</p>
            </div>
          ))}
        </div>
      )}

      {/* Uploaded Files List */}
      {files.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-white">Uploaded Files ({files.length})</h4>
          {files.map((file) => (
            <div key={file.id} className="bg-slate-700/50 rounded-lg p-3 flex items-center justify-between">
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <span className="text-lg flex-shrink-0">{getFileIcon(file.type)}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{file.name}</p>
                  <p className="text-slate-400 text-xs">
                    {formatFileSize(file.size)} • Uploaded {new Date(file.uploadedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2 flex-shrink-0">
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="text-slate-400 hover:text-white hover:bg-slate-600 cursor-pointer p-1"
                  onClick={() => window.open(file.url, "_blank")}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="text-red-400 hover:text-red-300 hover:bg-red-900/20 cursor-pointer p-1"
                  onClick={() => removeFile(file.id)}
                  disabled={disabled}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* File Limit Info */}
      <p className="text-xs text-slate-500 text-center">
        {files.length} of {maxFiles} files uploaded
      </p>
    </div>
  )
}
