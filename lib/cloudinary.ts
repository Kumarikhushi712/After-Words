// Cloudinary configuration and upload utilities
export const CLOUDINARY_CONFIG = {
  cloudName: "dsmjbrykk",
  uploadPreset: "lastnote",
  folder: "lastnote",
}

// Server-side configuration (for future server operations)
export const CLOUDINARY_SERVER_CONFIG = {
  cloudName: process.env.CLOUDINARY_CLOUD_NAME,
  apiKey: process.env.CLOUDINARY_API_KEY,
  apiSecret: process.env.CLOUDINARY_API_SECRET,
}

export interface CloudinaryUploadResult {
  public_id: string
  secure_url: string
  original_filename: string
  format: string
  bytes: number
  resource_type: string
  created_at: string
}

export interface UploadedFile {
  id: string
  name: string
  url: string
  size: number
  type: string
  uploadedAt: string
}

export async function uploadToCloudinary(file: File): Promise<UploadedFile> {
  const formData = new FormData()
  formData.append("file", file)
  formData.append("upload_preset", CLOUDINARY_CONFIG.uploadPreset)
  formData.append("folder", CLOUDINARY_CONFIG.folder)

  const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/auto/upload`, {
    method: "POST",
    body: formData,
  })

  if (!response.ok) {
    throw new Error(`Upload failed: ${response.statusText}`)
  }

  const result: CloudinaryUploadResult = await response.json()

  return {
    id: result.public_id,
    name: result.original_filename || file.name,
    url: result.secure_url,
    size: result.bytes,
    type: result.format,
    uploadedAt: result.created_at,
  }
}

// Server-side function for advanced operations (if needed in the future)
export async function deleteFromCloudinary(publicId: string): Promise<boolean> {
  if (!CLOUDINARY_SERVER_CONFIG.apiKey || !CLOUDINARY_SERVER_CONFIG.apiSecret) {
    console.warn("Cloudinary server credentials not configured")
    return false
  }

  try {
    // This would be used for server-side deletion if needed
    // For now, we'll keep files in Cloudinary for safety
    console.log(`Would delete file with public_id: ${publicId}`)
    return true
  } catch (error) {
    console.error("Error deleting from Cloudinary:", error)
    return false
  }
}

export function getFileIcon(fileType: string): string {
  const type = fileType.toLowerCase()

  if (type.includes("image")) return "🖼️"
  if (type.includes("pdf")) return "📄"
  if (type.includes("doc") || type.includes("word")) return "📝"
  if (type.includes("sheet") || type.includes("excel")) return "📊"
  if (type.includes("video")) return "🎥"
  if (type.includes("audio")) return "🎵"
  if (type.includes("zip") || type.includes("rar")) return "📦"

  return "📎"
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes"

  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}
