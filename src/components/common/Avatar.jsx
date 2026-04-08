const Avatar = ({ initials, bg = '#E6F1FB', tx = '#0C447C', size = 32 }) => (
  <div style={{
    width: size, height: size, borderRadius: '50%',
    background: bg, color: tx,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: size * 0.35, fontWeight: 500, flexShrink: 0,
  }}>
    {initials}
  </div>
)

export default Avatar
