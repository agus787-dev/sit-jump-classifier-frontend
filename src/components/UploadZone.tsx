import { Film, FolderUp, Upload } from 'lucide-react'
import { useRef, useState } from 'react'
import { validateVideoFile } from '../utils/format'
import { VideoPreview } from './VideoPreview'

type Props = {
  file: File | null
  onSelect: (file: File) => void
  onRemove: () => void
  disabled?: boolean
}

export function UploadZone({ file, onSelect, onRemove, disabled = false }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)

  const receiveFile = (candidate: File | undefined) => {
    if (!candidate) return
    const error = validateVideoFile(candidate)
    setValidationError(error)
    if (!error) onSelect(candidate)
  }

  const onInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    receiveFile(event.currentTarget.files?.[0])
    event.currentTarget.value = ''
  }

  const openPicker = () => {
    if (!disabled) inputRef.current?.click()
  }

  if (file) return <VideoPreview file={file} onRemove={onRemove} />

  return (
    <div>
      <div
        className={`upload-zone ${isDragging ? 'is-dragging' : ''} ${disabled ? 'is-disabled' : ''}`}
        onDragEnter={(event) => {
          event.preventDefault()
          setIsDragging(true)
        }}
        onDragOver={(event) => event.preventDefault()}
        onDragLeave={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setIsDragging(false)
        }}
        onDrop={(event) => {
          event.preventDefault()
          setIsDragging(false)
          receiveFile(event.dataTransfer.files[0])
        }}
        onClick={openPicker}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            openPicker()
          }
        }}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label="Choose a video to upload"
        aria-describedby={validationError ? 'upload-error' : 'upload-hint'}
        aria-disabled={disabled}
      >
        <input
          ref={inputRef}
          className="visually-hidden"
          type="file"
          accept=".mp4,.mov,.avi,.mkv,.webm,video/mp4,video/quicktime,video/x-msvideo,video/x-matroska,video/webm"
          onChange={onInputChange}
          disabled={disabled}
          tabIndex={-1}
          aria-hidden="true"
        />
        <span className="upload-icon"><FolderUp size={23} aria-hidden="true" /></span>
        <span className="upload-title">Drop your video here, or <strong>browse</strong></span>
        <span id="upload-hint" className="upload-hint">MP4, MOV, AVI, MKV or WEBM · up to 20 MB</span>
        <span className="upload-types" aria-hidden="true">
          <span><Film size={13} /> MP4</span>
          <span><Film size={13} /> MOV</span>
          <span><Film size={13} /> WEBM</span>
        </span>
        <span className="upload-browse"><Upload size={15} aria-hidden="true" /> Choose a video</span>
      </div>
      {validationError && <p className="validation-error" id="upload-error" role="alert">{validationError}</p>}
    </div>
  )
}
