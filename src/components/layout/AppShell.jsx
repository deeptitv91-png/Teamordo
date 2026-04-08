import { useAuth } from '../../context/AuthContext'
import Topbar from './Topbar'
import Sidebar from './Sidebar'

const AppShell = ({ children }) => {
  const { user } = useAuth()

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F8F8F6' }}>
      <Sidebar role={user?.role} category={user?.category} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Topbar />
        <main style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
          {children}
        </main>
      </div>
    </div>
  )
}

export default AppShell
