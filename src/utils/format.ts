const MAX_FILE_SIZE = 20 * 1024 * 1024
const ALLOWED_EXTENSIONS = ['.mp4', '.mov', '.avi', '.mkv', '.webm']

export function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function validateVideoFile(file: File): string | null {
  const extension = file.name.slice(file.name.lastIndexOf('.')).toLowerCase()
  if (!ALLOWED_EXTENSIONS.includes(extension)) {
    return 'That video format is not supported. Choose an MP4, MOV, AVI, MKV, or WEBM file.'
  }
  if (file.size > MAX_FILE_SIZE) {
    return 'This video is over 20 MB. Choose a smaller file to continue.'
  }
  if (file.size === 0) {
    return 'This file is empty. Choose a video with content.'
  }
  return null
}
