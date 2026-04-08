import { useEffect, useState } from 'react'

const COLORS = {
  ok:   { bg: '#EAF3DE', tx: '#27500A', border: '#97C459' },
  err:  { bg: '#FCEBEB', tx: '#791F1F', border: '#F09595' },
  info: { bg: '#E6F1FB', tx: '#0C447C', border: '#85B7EB' },
  warn: { bg: '#FAEEDA', tx: '#633806', border: '#FAC775' },
}

const Notify = ({ message, type = 'ok', onDone }) => {
  const [visible, setVisible] = useState(true)
  const c = COLORS[type] || COLORS.ok

  useEffect(() => {
    const t = setTimeout(() => { setVisible(false); onDone?.() }, 4000)
    return () => clearTimeout(t)
  }, [])

  if (!visible || !message) return null
  return (
    <div style={{
      padding: '10px 14px', borderRadius: '8px', fontSize: '13px',
      background: c.bg, color: c.tx, border: `0.5px solid ${c.border}`,
      marginBottom: '12px',
    }}>
      {message}
    </div>
  )
}

export default Notify
