const Badge = ({ label, color, textColor, style = {} }) => (
  <span style={{
    fontSize: '10px',
    padding: '2px 8px',
    borderRadius: '20px',
    fontWeight: 500,
    whiteSpace: 'nowrap',
    background: color || '#F1EFE8',
    color: textColor || '#444441',
    ...style,
  }}>
    {label}
  </span>
)

export default Badge
