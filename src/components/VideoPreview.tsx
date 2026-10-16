import { FileVideo, Trash2 } from 'lucide-react'
import { useCallback, useRef } from 'react'
import { formatFileSize } from '../utils/format'

type Props = {
  file: File
  onRemove: () => void
}

export function VideoPreview({ file, onRemove }: Props) {
  const previewUrlRef = useRef<string | null>(null)

  const attachVideo = useCallback((video: HTMLVideoElement | null) => {
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current)
    previewUrlRef.current = null
    if (!video) return

    const previewUrl = URL.createObjectURL(file)
    previewUrlRef.current = previewUrl
    video.src = previewUrl
    video.load()
  }, [file])

  return (
    <div className="preview-card">
      <div className="video-frame">
        <video ref={attachVideo} muted controls loop playsInline aria-label={`Preview of ${file.name}`} />
      </div>
      <div className="preview-meta">
        <div className="file-info">
          <span className="file-icon"><FileVideo size={18} aria-hidden="true" /></span>
          <div className="file-copy">
            <span className="file-name" title={file.name}>{file.name}</span>
            <span className="file-size">{formatFileSize(file.size)}</span>
          </div>
        </div>
        <button className="remove-button" type="button" onClick={onRemove}>
          <Trash2 size={15} aria-hidden="true" />
          <span>Remove</span>
        </button>
      </div>
    </div>
  )
}
