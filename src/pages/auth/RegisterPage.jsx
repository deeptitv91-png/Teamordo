import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { createCompany } from '../../firebase/firestore'
import { createUserAccount } from '../../firebase/auth'
import { generateCompanyId, generatePassword, generateCompanySlug } from '../../utils/idGenerator'
import Notify from '../../components/common/Notify'

const RECAPTCHA_SITE_KEY = '6LcZHrosAAAAAH6Uuo39fH2VnNN4xSIMM27UsCHX'

const RegisterPage = () => {
  const [form, setForm]             = useState({ companyName:'', address:'', numDepts:'', adminEmail:'' })
  const [loading, setLoading]       = useState(false)
  const [notify, setNotify]         = useState(null)
  const [credentials, setCredentials] = useState(null)
  const [captchaVerified, setCaptcha] = useState(false)
  const navigate = useNavigate()

  const handleChange = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleRegister = async (e) => {
    e.preventDefault()
    if (!form.companyName || !form.address || !form.numDepts || !form.adminEmail) {
      setNotify({ msg:'Please fill all fields.', type:'err' }); return
    }
    if (!captchaVerified) {
      setNotify({ msg:'Please complete the reCAPTCHA verification.', type:'err' }); return
    }
    setLoading(true)
    try {
      const companyId = generateCompanyId(form.companyName)
      const slug      = generateCompanySlug(form.companyName)
      const adminId   = companyId
      const adminPw   = generatePassword(form.companyName)

      // Free plan — max 1 department at registration
      const allowedDepts = 1

      await createCompany(companyId, {
        name:        form.companyName,
        address:     form.address,
        numDepts:    allowedDepts,
        adminEmail:  form.adminEmail,
        companyId,
        slug,
        memberCounter: 0,
        deptCounter:   0,
        status:       'active',
      })

      await createUserAccount(adminId, adminPw, companyId, {
        name:      form.companyName + ' Admin',
        role:      'admin',
        companyId,
        userId:    adminId,
        email:     form.adminEmail,
      })

      setCredentials({ companyId, adminId, adminPw, slug, numDepts: 1 })
    } catch (err) {
      setNotify({ msg:'Registration failed: ' + err.message, type:'err' })
    } finally {
      setLoading(false)
    }
  }

  // Load reCAPTCHA
  useState(() => {
    const script = document.createElement('script')
    script.src = 'https://www.google.com/recaptcha/api.js'
    script.async = true
    document.head.appendChild(script)
    window.onCaptchaSuccess = () => setCaptcha(true)
    window.onCaptchaExpired = () => setCaptcha(false)
  }, [])

  const loginUrl = credentials ? `teamordo.com/${credentials.slug}` : ''

  return (
    <div style={{ minHeight:'100vh', background:'#F8F8F6', display:'flex', alignItems:'center', justifyContent:'center', padding:'20px', fontFamily:'system-ui,sans-serif' }}>
      <div style={{ width:'100%', maxWidth:'440px' }}>
        <div style={{ marginBottom:'20px' }}>
          <button onClick={() => navigate('/')} style={{ background:'none', border:'none', fontSize:'13px', color:'#888', cursor:'pointer', fontFamily:'inherit', display:'flex', alignItems:'center', gap:'4px' }}>
            ← Back to home
          </button>
        </div>
        <div style={{ textAlign:'center', marginBottom:'24px' }}>
          <div style={{ fontSize:'26px', fontWeight:600, letterSpacing:'-0.02em' }}>Team<span style={{ color:'#378ADD', fontWeight:400 }}>ordo</span></div>
          <div style={{ fontSize:'13px', color:'#888', marginTop:'4px' }}>Register your company</div>
        </div>

        <div style={{ background:'#fff', border:'0.5px solid rgba(0,0,0,0.1)', borderRadius:'14px', padding:'28px' }}>
          {notify && <Notify message={notify.msg} type={notify.type} onDone={() => setNotify(null)} />}

          {!credentials ? (
            <form onSubmit={handleRegister}>
              {[
                { key:'companyName', label:'Company name',          placeholder:'e.g. Acme Technologies Pvt Ltd' },
                { key:'adminEmail',  label:'Admin email',           placeholder:'admin@yourcompany.com' },
                { key:'numDepts',    label:'Number of departments', placeholder:'e.g. 1', type:'number' },
              ].map(f => (
                <div key={f.key} style={{ marginBottom:'12px' }}>
                  <label style={lbl}>{f.label}</label>
                  <input style={inp} type={f.type||'text'} placeholder={f.placeholder} value={form[f.key]} onChange={handleChange(f.key)} />
                </div>
              ))}
              <div style={{ marginBottom:'16px' }}>
                <label style={lbl}>Company address</label>
                <textarea style={{ ...inp, height:'64px', resize:'none' }} placeholder="Full address..." value={form.address} onChange={handleChange('address')} />
              </div>
              <div style={{ marginBottom:'16px' }}>
                <div className="g-recaptcha" data-sitekey={RECAPTCHA_SITE_KEY} data-callback="onCaptchaSuccess" data-expired-callback="onCaptchaExpired" />
              </div>
              <button type="submit" disabled={loading || !captchaVerified} style={{ ...primaryBtn, opacity:(!captchaVerified||loading)?0.6:1, cursor:(!captchaVerified||loading)?'not-allowed':'pointer' }}>
                {loading ? 'Registering...' : 'Register & generate credentials'}
              </button>
            </form>
          ) : (
            <div>
              <div style={{ fontSize:'15px', fontWeight:600, color:'#27500A', marginBottom:'4px' }}>Registration successful!</div>
              <div style={{ fontSize:'12px', color:'#888', marginBottom:'20px' }}>Save all details below. Your team's login URL is ready.</div>

              {/* Company Login URL — most prominent */}
              <div style={{ background:'#EEF4FF', border:'1px solid #C7DCFF', borderRadius:'10px', padding:'16px', marginBottom:'16px' }}>
                <div style={{ fontSize:'11px', fontWeight:600, color:'#0C447C', marginBottom:'6px', textTransform:'uppercase', letterSpacing:'0.04em' }}>Your company login URL</div>
                <div style={{ fontSize:'16px', fontWeight:600, color:'#0a0a0a', fontFamily:'monospace', marginBottom:'6px' }}>
                  teamordo.com/{credentials.slug}
                </div>
                <div style={{ fontSize:'11px', color:'#666' }}>Share this URL with all your team members. They login here with their Member ID and password.</div>
              </div>

              {/* Admin credentials */}
              <div style={{ background:'#F8F8F6', borderRadius:'10px', padding:'14px', marginBottom:'16px' }}>
                <div style={{ fontSize:'11px', fontWeight:600, color:'#666', marginBottom:'10px', textTransform:'uppercase', letterSpacing:'0.04em' }}>Admin credentials — save these!</div>
                {[
                  { label:'Company ID',  value: credentials.companyId },
                  { label:'Admin ID',    value: credentials.adminId },
                  { label:'Password',    value: credentials.adminPw },
                  { label:'Departments', value: credentials.numDepts },
                ].map(row => (
                  <div key={row.label} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'8px', paddingBottom:'8px', borderBottom:'0.5px solid rgba(0,0,0,0.06)' }}>
                    <span style={{ fontSize:'11px', color:'#888' }}>{row.label}</span>
                    <span style={{ fontSize:'13px', fontWeight:500, fontFamily:'monospace' }}>{row.value}</span>
                  </div>
                ))}
              </div>

              <div style={{ fontSize:'11px', color:'#888', background:'#FAEEDA', padding:'10px 12px', borderRadius:'8px', marginBottom:'16px', border:'0.5px solid #FAC775' }}>
                Next: Login as admin → Create departments → Share dept IDs with your heads → They add team members.
              </div>

              <button onClick={() => navigate(`/${credentials.slug}`)} style={primaryBtn}>
                Go to your login page
              </button>
            </div>
          )}

          <div style={{ textAlign:'center', marginTop:'14px', fontSize:'12px', color:'#888' }}>
            Already registered? <Link to="/login" style={{ color:'#378ADD' }}>Login</Link>
          </div>
        </div>
      </div>
    </div>
  )
}

const lbl = { fontSize:'11px', fontWeight:500, color:'#666', display:'block', marginBottom:'4px', textTransform:'uppercase', letterSpacing:'0.04em' }
const inp = { width:'100%', padding:'9px 12px', fontSize:'13px', border:'0.5px solid rgba(0,0,0,0.2)', borderRadius:'8px', background:'#fff', fontFamily:'inherit', boxSizing:'border-box' }
const primaryBtn = { width:'100%', padding:'11px', fontSize:'13px', fontWeight:500, background:'#1a1a1a', color:'#fff', border:'none', borderRadius:'9px', cursor:'pointer', fontFamily:'inherit' }

export default RegisterPage
