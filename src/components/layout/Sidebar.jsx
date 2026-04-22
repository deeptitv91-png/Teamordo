import { NavLink } from 'react-router-dom'

const LINKS = {
  admin: [
    { to: '/admin',             label: 'Overview' },
    { to: '/admin/departments', label: 'Departments' },
    { to: '/admin/reports',     label: 'Reports' },
    { to: '/admin/upgrade',     label: 'Upgrade plan' },
  ],
  dept_head: [
    { to: '/dept',          label: 'Dashboard' },
    { to: '/dept/members',  label: 'Team members' },
    { to: '/dept/tasks',    label: 'All tasks' },
    { to: '/dept/uploads',  label: 'Work uploads' },
    { to: '/dept/reports',  label: 'Reports' },
  ],
  member: [
    { to: '/member',          label: 'My tasks' },
    { to: '/member/all-tasks',label: 'All tasks' },
    { to: '/member/uploads',  label: 'Upload work' },
    { to: '/member/reports',  label: 'Reports' },
  ],
}

const Sidebar = ({ role }) => {
  const links = LINKS[role] || []

  return (
    <div style={{
      width: '200px', flexShrink: 0,
      background: '#fff', borderRight: '0.5px solid rgba(0,0,0,0.08)',
      display: 'flex', flexDirection: 'column', padding: '16px 0',
    }}>
      <div style={{ padding: '0 16px 20px', fontSize: '17px', fontWeight: 500 }}>
        Team<span style={{ color: '#888', fontWeight: 400 }}>ordo</span>
      </div>
      {links.map(link => (
        <NavLink
          key={link.to}
          to={link.to}
          end={link.to === '/admin' || link.to === '/dept' || link.to === '/member'}
          style={({ isActive }) => ({
            display: 'block', padding: '8px 16px',
            fontSize: '13px', textDecoration: 'none',
            color: isActive ? '#1a1a1a' : '#666',
            fontWeight: isActive ? 500 : 400,
            background: isActive ? '#F0F0EE' : 'transparent',
            borderRadius: '6px', margin: '1px 8px',
          })}
        >
          {link.label}
        </NavLink>
      ))}
    </div>
  )
}

export default Sidebar
