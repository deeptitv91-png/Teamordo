import { useRef, useState } from 'react'

const ALLOWED_TYPES = {
  'image/jpeg': 'Image',
  'image/png':  'Image',
  'video/mp4':  'Video',
  'application/pdf': 'PDF',
  'application/msword': 'Word',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Word',
}

const MAX_SIZE = 50 * 1024 * 1024 // 50MB

const UploadZone = ({ onFileSelected, disabled }) => {
  const inputRef  = useRef()
  const [dragging, setDragging] = useState(false)
  const [error,    setError]    = useState('')

  const validate = (file) => {
    if (!ALLOWED_TYPES[file.type]) {
      setError('File type not allowed. Use JPG, PNG, MP4, PDF, or Word.')
      return false
    }
    if (file.size > MAX_SIZE) {
      setError('File too large. Max 50MB.')
      return false
    }
    setError('')
    return true
  }

  const handleFile = (file) => {
    if (file && validate(file)) {
      onFileSelected(file, ALLOWED_TYPES[file.type])
    }
  }

  const onDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    handleFile(file)
  }

  return (
    <div>
      <div
        onClick={() => !disabled && inputRef.current.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        style={{
          border: `2px dashed ${dragging ? '#378ADD' : 'rgba(0,0,0,0.15)'}`,
          borderRadius: '12px',
          padding: '28px',
          textAlign: 'center',
          cursor: disabled ? 'not-allowed' : 'pointer',
          background: dragging ? '#EEF6FF' : 'transparent',
          transition: 'all 0.15s',
          opacity: disabled ? 0.5 : 1,
        }}
      >
        <div style={{ fontSize: '14px', fontWeight: 500, marginBottom: '4px' }}>
          Click or drag file to upload
        </div>
        <div style={{ fontSize: '12px', color: '#888' }}>
          JPG, PNG, MP4, PDF, Word · Max 50MB
        </div>
      </div>
      {error && (
        <div style={{ fontSize: '12px', color: '#791F1F', marginTop: '6px' }}>{error}</div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.mp4,.pdf,.doc,.docx"
        style={{ display: 'none' }}
        onChange={(e) => handleFile(e.target.files[0])}
      />
    </div>
  )
}

export default UploadZone
