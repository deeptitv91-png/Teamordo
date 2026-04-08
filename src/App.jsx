import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { CompanyProvider } from './context/CompanyContext'
import ProtectedRoute from './components/common/ProtectedRoute'
import AppShell from './components/layout/AppShell'

import LandingPage         from './pages/LandingPage'
import LoginPage           from './pages/auth/LoginPage'
import RegisterPage        from './pages/auth/RegisterPage'
import CompanyLoginPage    from './pages/auth/CompanyLoginPage'
import AdminDashboard      from './pages/admin/AdminDashboard'
import MemberManager       from './pages/department/MemberManager'
import DeptDashboard       from './pages/department/DeptDashboard'
import MyTasks             from './pages/member/MyTasks'
import AllTasks            from './pages/member/AllTasks'
import WorkUpload          from './pages/member/WorkUpload'
import ReportsPage         from './pages/shared/ReportsPage'
import SuperAdminLogin     from './pages/superadmin/SuperAdminLogin'
import SuperAdminDashboard from './pages/superadmin/SuperAdminDashboard'

const Unauthorized = () => (
  <div style={{ padding:'40px', textAlign:'center', fontSize:'14px', color:'#888' }}>
    You don't have access to this page.
    <br />
    <a href="/login" style={{ color:'#378ADD', marginTop:'10px', display:'inline-block' }}>Back to login</a>
  </div>
)

const wrap = (roles, Page, props = {}) => (
  <ProtectedRoute allowedRoles={roles}>
    <AppShell><Page {...props} /></AppShell>
  </ProtectedRoute>
)

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <CompanyProvider>
        <Routes>
          <Route path="/"             element={<LandingPage />} />
          <Route path="/login"        element={<LoginPage />} />
          <Route path="/register"     element={<RegisterPage />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Company-specific login — e.g. /acme-technologies */}
          <Route path="/:slug"        element={<CompanyLoginPage />} />

          {/* Super Admin */}
          <Route path="/superadmin/login" element={<SuperAdminLogin />} />
          <Route path="/superadmin"       element={<SuperAdminDashboard />} />

          {/* Admin */}
          <Route path="/admin"             element={wrap(['admin'], AdminDashboard)} />
          <Route path="/admin/departments" element={wrap(['admin'], AdminDashboard)} />
          <Route path="/admin/reports"     element={wrap(['admin'], ReportsPage)} />

          {/* Dept head */}
          <Route path="/dept"         element={wrap(['dept_head'], DeptDashboard)} />
          <Route path="/dept/members" element={wrap(['dept_head'], MemberManager)} />
          <Route path="/dept/tasks"   element={wrap(['dept_head'], AllTasks)} />
          <Route path="/dept/uploads" element={wrap(['dept_head'], WorkUpload, { viewAll: true })} />
          <Route path="/dept/reports" element={wrap(['dept_head'], ReportsPage)} />

          {/* Member */}
          <Route path="/member"           element={wrap(['member'], MyTasks)} />
          <Route path="/member/all-tasks" element={wrap(['member'], AllTasks)} />
          <Route path="/member/uploads"   element={wrap(['member'], WorkUpload)} />
          <Route path="/member/reports"   element={wrap(['member'], ReportsPage)} />
        </Routes>
      </CompanyProvider>
    </AuthProvider>
  </BrowserRouter>
)

export default App
