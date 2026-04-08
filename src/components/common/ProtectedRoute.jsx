import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

// allowedRoles: ['admin'] | ['dept_head'] | ['member'] | ['admin','dept_head'] etc.
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth()

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', fontFamily:'sans-serif', color:'#888' }}>
      Loading...
    </div>
  )

  if (!user) return <Navigate to="/login" replace />

  if (allowedRoles && !allowedRoles.includes(user.role))
    return <Navigate to="/unauthorized" replace />

  return children
}

export default ProtectedRoute
