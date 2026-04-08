import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../../firebase/config'

const SUPER_ADMIN_EMAIL = 'mail.deeptitv@gmail.com'

const SuperAdminLogin = () => {
  const [password, setPassword] = useState('')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const cred = await signInWithEmailAndPassword(auth, SUPER_ADMIN_EMAIL, password)
      navigate('/superadmin')
    } catch (err) {
      setError('Invalid password. Access denied.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight:'100vh', background:'#0f0f1a', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'system-ui,sans-serif' }}>
      <div style={{ width:'100%', maxWidth:'380px', padding:'20px' }}>
        <div style={{ textAlign:'center', marginBottom:'28px' }}>
          <div style={{ fontSize:'24px', fontWeight:600, color:'#fff' }}>Team<span style={{ color:'#378ADD' }}>ordo</span></div>
          <div style={{ fontSize:'12px', color:'#555', marginTop:'4px' }}>Super Admin Access</div>
        </div>
        <div style={{ background:'#1a1a2e', border:'1px solid #2a2a4a', borderRadius:'12px', padding:'24px' }}>
          <div style={{ fontSize:'14px', fontWeight:500, color:'#fff', marginBottom:'20px' }}>Admin login</div>
          {error && <div style={{ padding:'8px 12px', background:'#3a1a1a', color:'#f87171', borderRadius:'8px', fontSize:'12px', marginBottom:'14px' }}>{error}</div>}
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom:'12px' }}>
              <label style={{ fontSize:'11px', color:'#666', display:'block', marginBottom:'4px', textTransform:'uppercase', letterSpacing:'0.04em' }}>Email</label>
              <div style={{ padding:'9px 12px', background:'#0f0f1a', border:'1px solid #2a2a4a', borderRadius:'8px', fontSize:'13px', color:'#666' }}>
                {SUPER_ADMIN_EMAIL}
              </div>
            </div>
            <div style={{ marginBottom:'20px' }}>
              <label style={{ fontSize:'11px', color:'#666', display:'block', marginBottom:'4px', textTransform:'uppercase', letterSpacing:'0.04em' }}>Password</label>
              <input
                type="password"
                style={{ width:'100%', padding:'9px 12px', background:'#0f0f1a', border:'1px solid #2a2a4a', borderRadius:'8px', fontSize:'13px', color:'#e0e0e0', fontFamily:'inherit', boxSizing:'border-box' }}
                placeholder="Your password"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>
            <button type="submit" disabled={loading} style={{ width:'100%', padding:'10px', fontSize:'13px', fontWeight:500, background:'#378ADD', color:'#fff', border:'none', borderRadius:'8px', cursor:'pointer', opacity: loading?0.7:1 }}>
              {loading ? 'Verifying...' : 'Access Super Admin'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default SuperAdminLogin
