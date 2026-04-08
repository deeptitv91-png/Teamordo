import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '../../firebase/config'
import { loginUser } from '../../firebase/auth'
import { detectRoleFromId } from '../../utils/idGenerator'
import { useAuth } from '../../context/AuthContext'
import Notify from '../../components/common/Notify'
import { sendPasswordResetEmail } from 'firebase/auth'
import { auth } from '../../firebase/config'

const CompanyLoginPage = () => {
  const { slug }    = useParams()
  const navigate    = useNavigate()
  const { setUser } = useAuth()

  const [company,   setCompany]   = useState(null)
  const [loading,   setLoading]   = useState(true)
  const [notFound,  setNotFound]  = useState(false)
  const [userId,    setUserId]    = useState('')
  const [password,  setPassword]  = useState('')
  const [submitting,setSubmitting]= useState(false)
  const [error,     setError]     = useState('')
  const [notify,    setNotify]    = useState(null)
  const [showReset, setShowReset] = useState(false)
  const [resetEmail,setResetEmail]= useState('')
  const [resetSent, setResetSent] = useState(false)

  useEffect(() => {
    const findCompany = async () => {
      try {
        const snap = await getDocs(collection(db, 'companies'))
        const match = snap.docs.find(d => {
          const data = d.data()
          const generatedSlug = data.name?.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
          return generatedSlug === slug || data.slug === slug
        })
        if (match) {
          setCompany({ id: match.id, ...match.data() })
        } else {
          setNotFound(true)
        }
      } catch (err) {
        setNotFound(true)
      } finally {
        setLoading(false)
      }
    }
    findCompany()
  }, [slug])

  const detectedRole = detectRoleFromId(userId.trim().toUpperCase())

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    if (!userId || !password) { setError('Please enter your ID and password.'); return }
    const role = detectRoleFromId(userId.trim().toUpperCase())
    if (!role) { setError('Invalid ID format. Must start with CORP-, DEPT-, or MEM-'); return }
    setSubmitting(true)
    try {
      const profile = await loginUser(userId.trim().toUpperCase(), password, company.id)
      setUser(profile)
      if (role === 'admin')     navigate('/admin')
      if (role === 'dept_head') navigate('/dept')
      if (role === 'member')    navigate('/member')
    } catch (err) {
      setError('Invalid credentials. Please check your ID and password.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleReset = async () => {
    if (!resetEmail.trim()) { setNotify({ msg:'Please enter your email.', type:'err' }); return }
    try {
      await sendPasswordResetEmail(auth, resetEmail.trim())
      setResetSent(true)
    } catch (err) {
      setNotify({ msg:'Email not found.', type:'err' })
    }
  }

  if (loading) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#F8F8F6', fontFamily:'system-ui,sans-serif', color:'#888', fontSize:'14px' }}>
      Loading...
    </div>
  )

  if (notFound) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#F8F8F6', fontFamily:'system-ui,sans-serif' }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ fontSize:'20px', fontWeight:500, marginBottom:'8px' }}>Company not found</div>
        <div style={{ fontSize:'14px', color:'#888', marginBottom:'20px' }}>The URL <strong>{slug}</strong> doesn't match any registered company.</div>
        <Link to="/register" style={{ color:'#378ADD', fontSize:'14px' }}>Register your company →</Link>
      </div>
    </div>
  )

  // Generate initials from company name
  const initials = company.name?.split(' ').map(w=>w[0]).join('').substring(0,2).toUpperCase()

  return (
    <div style={{ minHeight:'100vh', background:'#F8F8F6', display:'flex', alignItems:'center', justifyContent:'center', padding:'20px', fontFamily:'system-ui,sans-serif' }}>
      <div style={{ width:'100%', maxWidth:'400px' }}>

        {/* Company branding */}
        <div style={{ textAlign:'center', marginBottom:'28px' }}>
          <div style={{ width:'56px', height:'56px', borderRadius:'14px', background:'#1a1a1a', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 12px', fontSize:'20px', fontWeight:700, color:'#fff' }}>
            {initials}
          </div>
          <div style={{ fontSize:'20px', fontWeight:600, color:'#0a0a0a', marginBottom:'2px' }}>{company.name}</div>
          <div style={{ fontSize:'12px', color:'#888' }}>
            Powered by <span style={{ fontWeight:500 }}>Team<span style={{ color:'#378ADD' }}>ordo</span></span>
          </div>
        </div>

        <div style={{ background:'#fff', border:'0.5px solid rgba(0,0,0,0.1)', borderRadius:'14px', padding:'28px' }}>
          {notify && <Notify message={notify.msg} type={notify.type} onDone={() => setNotify(null)} />}

          {!showReset ? (
            <>
              <div style={{ fontSize:'15px', fontWeight:500, marginBottom:'20px', color:'#0a0a0a' }}>Login to your workspace</div>
              {error && <div style={{ padding:'9px 12px', background:'#FCEBEB', color:'#791F1F', borderRadius:'8px', fontSize:'12px', marginBottom:'14px', border:'0.5px solid #F09595' }}>{error}</div>}
              <form onSubmit={handleLogin}>
                <div style={{ marginBottom:'12px' }}>
                  <label style={lbl}>Your ID</label>
                  <input style={inp} placeholder="CORP-... or DEPT-... or MEM-..." value={userId} onChange={e => setUserId(e.target.value)} />
                  {detectedRole && (
                    <div style={{ fontSize:'11px', marginTop:'3px', color:'#378ADD' }}>
                      {detectedRole==='admin'?'Admin login':detectedRole==='dept_head'?'Department head':'Team member'}
                    </div>
                  )}
                </div>
                <div style={{ marginBottom:'8px' }}>
                  <label style={lbl}>Password</label>
                  <input style={inp} type="password" placeholder="Your password" value={password} onChange={e => setPassword(e.target.value)} />
                </div>
                <div style={{ textAlign:'right', marginBottom:'18px' }}>
                  <button type="button" onClick={() => setShowReset(true)} style={{ fontSize:'12px', color:'#378ADD', background:'none', border:'none', cursor:'pointer', padding:0 }}>
                    Forgot password?
                  </button>
                </div>
                <button type="submit" disabled={submitting} style={{ width:'100%', padding:'11px', fontSize:'13px', fontWeight:500, background:'#1a1a1a', color:'#fff', border:'none', borderRadius:'9px', cursor:'pointer', opacity:submitting?0.7:1 }}>
                  {submitting ? 'Logging in...' : 'Login'}
                </button>
              </form>
            </>
          ) : (
            <>
              <div style={{ fontSize:'15px', fontWeight:500, marginBottom:'6px' }}>Reset password</div>
              <div style={{ fontSize:'12px', color:'#888', marginBottom:'18px' }}>Enter your email and we'll send a reset link.</div>
              {!resetSent ? (
                <>
                  <div style={{ marginBottom:'14px' }}>
                    <label style={lbl}>Email address</label>
                    <input style={inp} type="email" placeholder="your@email.com" value={resetEmail} onChange={e => setResetEmail(e.target.value)} />
                  </div>
                  <button onClick={handleReset} style={{ width:'100%', padding:'11px', fontSize:'13px', fontWeight:500, background:'#1a1a1a', color:'#fff', border:'none', borderRadius:'9px', cursor:'pointer', marginBottom:'10px' }}>
                    Send reset email
                  </button>
                </>
              ) : (
                <div style={{ textAlign:'center', padding:'16px 0', fontSize:'13px', color:'#27500A' }}>Reset email sent! Check your inbox.</div>
              )}
              <button onClick={() => { setShowReset(false); setResetSent(false) }} style={{ width:'100%', padding:'9px', fontSize:'12px', background:'none', border:'0.5px solid rgba(0,0,0,0.15)', borderRadius:'8px', cursor:'pointer', color:'#666' }}>
                Back to login
              </button>
            </>
          )}
        </div>

        {/* ID guide */}
        <div style={{ marginTop:'14px', background:'#fff', border:'0.5px solid rgba(0,0,0,0.08)', borderRadius:'10px', padding:'12px 16px' }}>
          <div style={{ fontSize:'11px', fontWeight:500, color:'#aaa', marginBottom:'6px', textTransform:'uppercase', letterSpacing:'0.04em' }}>ID format guide</div>
          <div style={{ fontSize:'11px', color:'#aaa', lineHeight:'1.9' }}>
            <span style={{ fontFamily:'monospace', color:'#534AB7' }}>CORP-...</span> Admin &nbsp;·&nbsp;
            <span style={{ fontFamily:'monospace', color:'#085041' }}>DEPT-...</span> Dept head &nbsp;·&nbsp;
            <span style={{ fontFamily:'monospace', color:'#0C447C' }}>MEM-...</span> Member
          </div>
        </div>

        <div style={{ textAlign:'center', marginTop:'16px', fontSize:'12px', color:'#aaa' }}>
          <Link to="/" style={{ color:'#aaa' }}>teamordo.vercel.app</Link>
        </div>
      </div>
    </div>
  )
}

const lbl = { fontSize:'11px', fontWeight:500, color:'#666', display:'block', marginBottom:'4px', textTransform:'uppercase', letterSpacing:'0.04em' }
const inp = { width:'100%', padding:'9px 12px', fontSize:'13px', border:'0.5px solid rgba(0,0,0,0.2)', borderRadius:'8px', background:'#fff', fontFamily:'inherit', boxSizing:'border-box' }

export default CompanyLoginPage
