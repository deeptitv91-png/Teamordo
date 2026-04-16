import { useState } from 'react'

const UploadZone = ({ onLinkSubmitted, disabled }) => {
  const [link,  setLink]  = useState('')
  const [title, setTitle] = useState('')
  const [error, setError] = useState('')

  const validate = (url) => {
    try { new URL(url); return true }
    catch { return false }
  }

  const handleSubmit = () => {
    if (!title.trim()) { setError('Please add a title for your work.'); return }
    if (!link.trim())  { setError('Please paste a link.'); return }
    if (!validate(link.trim())) { setError('Please enter a valid URL starting with https://'); return }
    setError('')
    onLinkSubmitted({ link: link.trim(), title: title.trim() })
    setLink('')
    setTitle('')
  }

  return (
    <div>
      <div style={{ marginBottom:'10px' }}>
        <label style={lbl}>Work title</label>
        <input style={inp} placeholder="e.g. Homepage design v2, Product launch reel..." value={title} onChange={e => setTitle(e.target.value)} disabled={disabled} />
      </div>
      <div style={{ marginBottom:'10px' }}>
        <label style={lbl}>Paste link to your work</label>
        <input style={inp} placeholder="https://drive.google.com/... or https://figma.com/..." value={link} onChange={e => setLink(e.target.value)} disabled={disabled} onKeyDown={e => e.key==='Enter' && handleSubmit()} />
      </div>
      <div style={{ fontSize:'11px', color:'#888', marginBottom:'10px', padding:'8px 12px', background:'#F8F8F6', borderRadius:'6px' }}>
        Works with: Google Drive · Figma · YouTube · Dropbox · Notion · Canva · Any public link
      </div>
      {error && <div style={{ fontSize:'12px', color:'#791F1F', marginBottom:'8px' }}>{error}</div>}
      <button onClick={handleSubmit} disabled={disabled} style={{ padding:'8px 18px', fontSize:'13px', fontWeight:500, background: disabled?'#ccc':'#378ADD', color:'#fff', border:'none', borderRadius:'8px', cursor: disabled?'not-allowed':'pointer' }}>
        Submit for review
      </button>
    </div>
  )
}

const lbl = { fontSize:'11px', fontWeight:500, color:'#666', display:'block', marginBottom:'4px', textTransform:'uppercase', letterSpacing:'0.04em' }
const inp = { width:'100%', padding:'9px 12px', fontSize:'13px', border:'0.5px solid rgba(0,0,0,0.2)', borderRadius:'8px', fontFamily:'inherit', boxSizing:'border-box' }

export default UploadZone
