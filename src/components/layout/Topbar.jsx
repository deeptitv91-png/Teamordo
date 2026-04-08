import { useAuth } from '../../context/AuthContext'
import { useCompany } from '../../context/CompanyContext'
import Avatar from '../common/Avatar'
import Badge from '../common/Badge'
import { getCategoryColor } from '../../utils/roleDetector'

const roleLabel = { admin: 'Admin', dept_head: 'Dept Head', member: 'Member' }

const Topbar = () => {
  const { user, logout } = useAuth()
  const { company } = useCompany()
  const catColor = user?.category ? getCategoryColor(user.category) : null

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '12px 24px', background: '#fff',
      borderBottom: '0.5px solid rgba(0,0,0,0.08)',
    }}>
      <div style={{ fontSize: '13px', color: '#888' }}>
        {company?.name || 'Teamordo'}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Avatar
          initials={(user?.name || 'U').split(' ').map(w => w[0]).join('').substring(0,2).toUpperCase()}
          bg={catColor?.bg || '#E6F1FB'}
          tx={catColor?.tx || '#0C447C'}
        />
        <div>
          <div style={{ fontSize: '13px', fontWeight: 500 }}>{user?.name}</div>
          <div style={{ fontSize: '11px', color: '#888' }}>
            {user?.designation || roleLabel[user?.role]} · {user?.userId}
          </div>
        </div>
        {catColor && <Badge label={catColor.label} color={catColor.bg} textColor={catColor.tx} />}
        <button
          onClick={logout}
          style={{
            padding: '5px 12px', fontSize: '12px', borderRadius: '8px',
            border: '0.5px solid rgba(0,0,0,0.15)', background: 'transparent',
            cursor: 'pointer', color: '#444',
          }}
        >
          Logout
        </button>
      </div>
    </div>
  )
}

export default Topbar
