import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { loginUser } from '../../firebase/auth'
import { detectRoleFromId } from '../../utils/idGenerator'
import { useAuth } from '../../context/AuthContext'
import Notify from '../../components/common/Notify'
import { sendPasswordResetEmail } from 'firebase/auth'
import { auth } from '../../firebase/config'

const LoginPage = () => {
  const [userId,    setUserId]    = useState('')
  const [password,  setPassword]  = useState('')
  const [companyId, setCompanyId] = useState('')
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState('')
  const [notify,    setNotify]    = useState(null)
  const [showReset, setShowReset] = useState(false)
  const [resetEmail,setResetEmail]= useState('')
  const [resetSent, setResetSent] = useState(false)
  const { setUser } = useAuth()
  const navigate = useNavigate()

  const detectedRole = detectRoleFromId(userId.trim().toUpperCase())

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    if (!userId || !password || !companyId) { setError('Please fill all fields.'); return }
    const role = detectRoleFromId(userId.trim().toUpperCase())
    if (!role) { setError('Invalid ID format. Must start with CORP-, DEPT-, or MEM-'); return }
    setLoading(true)
    try {
      const profile = await loginUser(userId.trim().toUpperCase(), password, companyId.trim().toUpperCase())
      setUser(profile)
      if (role === 'admin')     navigate('/admin')
      if (role === 'dept_head') navigate('/dept')
      if (role === 'member')    navigate('/member')
    } catch (err) {
      setError('Invalid credentials. Please check your ID and password.')
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordReset = async () => {
    if (!resetEmail.trim()) { setNotify({ msg:'Please enter your email address.', type:'err' }); return }
    try {
      await sendPasswordResetEmail(auth, resetEmail.trim())
      setResetSent(true)
      setNotify({ msg:'Password reset email sent! Check your inbox.', type:'ok' })
    } catch (err) {
      setNotify({ msg:'Email not found. Please check and try again.', type:'err' })
    }
  }

  return (
    <div style={{ minHeight:'100vh', background:'#F8F8F6', display:'flex', alignItems:'center', justifyContent:'center', padding:'20px' }}>
      <div style={{ width:'100%', maxWidth:'400px' }}>
        <div style={{ textAlign:'center', marginBottom:'28px' }}>
          <div style={{ fontSize:'28px', fontWeight:500 }}>Team<span style={{ color:'#888', fontWeight:400 }}>ordo</span></div>
          <div style={{ fontSize:'13px', color:'#888', marginTop:'4px' }}>Project management platform for teams of all sizes</div>
        </div>

        <div style={{ background:'#fff', border:'0.5px solid rgba(0,0,0,0.1)', borderRadius:'12px', padding:'24px' }}>

          {!showReset ? (
            <>
              <div style={{ fontSize:'15px', fontWeight:500, marginBottom:'20px' }}>Login</div>
              {error && <Notify message={error} type="err" onDone={() => setError('')} />}
              {notify && <Notify message={notify.msg} type={notify.type} onDone={() => setNotify(null)} />}

              <form onSubmit={handleLogin}>
                <div style={{ marginBottom:'12px' }}>
                  <label style={labelStyle}>Company ID</label>
                  <input style={inputStyle} placeholder="e.g. CORP-ACME-TECHNOLOGIES-X4K2" value={companyId} onChange={e => setCompanyId(e.target.value)} />
                  <div style={{ fontSize:'11px', color:'#888', marginTop:'3px' }}>Your company unique ID (from registration)</div>
                </div>

                <div style={{ marginBottom:'12px' }}>
                  <label style={labelStyle}>Your ID</label>
                  <input style={inputStyle} placeholder="CORP-... or DEPT-... or MEM-..." value={userId} onChange={e => setUserId(e.target.value)} />
                  {detectedRole && (
                    <div style={{ fontSize:'11px', marginTop:'3px', color: detectedRole==='admin'?'#3C3489':detectedRole==='dept_head'?'#085041':'#0C447C' }}>
                      Detected: {detectedRole==='admin'?'Admin login':detectedRole==='dept_head'?'Department head login':'Member login'}
                    </div>
                  )}
                </div>

                <div style={{ marginBottom:'8px' }}>
                  <label style={labelStyle}>Password</label>
                  <input style={inputStyle} type="password" placeholder="Your password" value={password} onChange={e => setPassword(e.target.value)} />
                </div>

                <div style={{ textAlign:'right', marginBottom:'16px' }}>
                  <button type="button" onClick={() => setShowReset(true)} style={{ fontSize:'12px', color:'#378ADD', background:'none', border:'none', cursor:'pointer', padding:0 }}>
                    Forgot password?
                  </button>
                </div>

                <button type="submit" disabled={loading} style={{ width:'100%', padding:'10px', fontSize:'13px', fontWeight:500, background:'#378ADD', color:'#fff', border:'none', borderRadius:'8px', cursor:'pointer', opacity: loading ? 0.7 : 1 }}>
                  {loading ? 'Logging in...' : 'Login'}
                </button>
              </form>

              <div style={{ textAlign:'center', marginTop:'16px', fontSize:'12px', color:'#888' }}>
                New company? <Link to="/register" style={{ color:'#378ADD' }}>Register here</Link>
              </div>
            </>
          ) : (
            <>
              <div style={{ fontSize:'15px', fontWeight:500, marginBottom:'6px' }}>Reset password</div>
              <div style={{ fontSize:'12px', color:'#888', marginBottom:'20px' }}>Enter your email address and we'll send you a reset link.</div>

              {notify && <Notify message={notify.msg} type={notify.type} onDone={() => setNotify(null)} />}

              {!resetSent ? (
                <>
                  <div style={{ marginBottom:'16px' }}>
                    <label style={labelStyle}>Email address</label>
                    <input style={inputStyle} type="email" placeholder="your@email.com" value={resetEmail} onChange={e => setResetEmail(e.target.value)} />
                  </div>
                  <button onClick={handlePasswordReset} style={{ width:'100%', padding:'10px', fontSize:'13px', fontWeight:500, background:'#378ADD', color:'#fff', border:'none', borderRadius:'8px', cursor:'pointer', marginBottom:'12px' }}>
                    Send reset email
                  </button>
                </>
              ) : (
                <div style={{ textAlign:'center', padding:'20px 0', fontSize:'13px', color:'#27500A' }}>
                  Reset email sent! Check your inbox.
                </div>
              )}

              <button onClick={() => { setShowReset(false); setResetSent(false); setResetEmail('') }} style={{ width:'100%', padding:'8px', fontSize:'12px', background:'none', border:'0.5px solid rgba(0,0,0,0.15)', borderRadius:'8px', cursor:'pointer', color:'#666' }}>
                Back to login
              </button>
            </>
          )}
        </div>

        <div style={{ marginTop:'16px', background:'#fff', border:'0.5px solid rgba(0,0,0,0.1)', borderRadius:'12px', padding:'14px 16px' }}>
          <div style={{ fontSize:'11px', fontWeight:500, color:'#666', marginBottom:'8px' }}>ID FORMAT GUIDE</div>
          <div style={{ fontSize:'11px', color:'#888', lineHeight:'1.8' }}>
            <span style={{ fontFamily:'monospace', color:'#3C3489' }}>CORP-XXXX-XXXX</span> → Admin (company owner)<br/>
            <span style={{ fontFamily:'monospace', color:'#085041' }}>DEPT-XXX-000</span> → Department head<br/>
            <span style={{ fontFamily:'monospace', color:'#0C447C' }}>MEM-XX-0000</span> → Team member
          </div>
        </div>
      </div>
    </div>
  )
}

const labelStyle = { fontSize:'11px', fontWeight:500, color:'#666', display:'block', marginBottom:'4px', textTransform:'uppercase', letterSpacing:'0.04em' }
const inputStyle  = { width:'100%', padding:'9px 12px', fontSize:'13px', border:'0.5px solid rgba(0,0,0,0.2)', borderRadius:'8px', background:'#fff', fontFamily:'inherit', boxSizing:'border-box' }

export default LoginPage
