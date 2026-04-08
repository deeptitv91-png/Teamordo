import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { createCompany, createUser } from '../../firebase/firestore'
import { createUserAccount } from '../../firebase/auth'
import { generateCompanyId, generatePassword } from '../../utils/idGenerator'
import Notify from '../../components/common/Notify'

const RegisterPage = () => {
  const [form, setForm] = useState({ companyName:'', address:'', numDepts:'', adminEmail:'' })
  const [loading, setLoading] = useState(false)
  const [notify, setNotify] = useState(null)
  const [credentials, setCredentials] = useState(null)
  const navigate = useNavigate()

  const handleChange = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleRegister = async (e) => {
    e.preventDefault()
    if (!form.companyName || !form.address || !form.numDepts || !form.adminEmail) {
      setNotify({ msg:'Please fill all fields.', type:'err' }); return
    }
    setLoading(true)
    try {
      const companyId = generateCompanyId(form.companyName)
      const adminId   = companyId  // Admin ID same as company ID
      const adminPw   = generatePassword(form.companyName)

      // Create company doc
      await createCompany(companyId, {
        name: form.companyName,
        address: form.address,
        numDepts: parseInt(form.numDepts),
        adminEmail: form.adminEmail,
        companyId,
        memberCounter: 0,
        deptCounter: 0,
      })

      // Create admin Firebase Auth account + Firestore user
      await createUserAccount(adminId, adminPw, companyId, {
        name: form.companyName + ' Admin',
        role: 'admin',
        companyId,
        userId: adminId,
        email: form.adminEmail,
      })

      setCredentials({ companyId, adminId, adminPw, numDepts: parseInt(form.numDepts) })
      setNotify({ msg: 'Company registered successfully!', type: 'ok' })
    } catch (err) {
      setNotify({ msg: 'Registration failed: ' + err.message, type: 'err' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight:'100vh', background:'#F8F8F6', display:'flex', alignItems:'center', justifyContent:'center', padding:'20px' }}>
      <div style={{ width:'100%', maxWidth:'440px' }}>
        <div style={{ textAlign:'center', marginBottom:'24px' }}>
          <div style={{ fontSize:'26px', fontWeight:500 }}>Team<span style={{ color:'#888', fontWeight:400 }}>ordo</span></div>
          <div style={{ fontSize:'13px', color:'#888', marginTop:'4px' }}>Register your company</div>
        </div>

        <div style={{ background:'#fff', border:'0.5px solid rgba(0,0,0,0.1)', borderRadius:'12px', padding:'24px' }}>
          {notify && <Notify message={notify.msg} type={notify.type} onDone={() => setNotify(null)} />}

          {!credentials ? (
            <form onSubmit={handleRegister}>
              {[
                { key:'companyName', label:'Company name', placeholder:'e.g. Acme Technologies Pvt Ltd' },
                { key:'adminEmail',  label:'Admin email',  placeholder:'admin@yourcompany.com' },
                { key:'numDepts',    label:'Number of departments', placeholder:'e.g. 4', type:'number' },
              ].map(f => (
                <div key={f.key} style={{ marginBottom:'12px' }}>
                  <label style={labelStyle}>{f.label}</label>
                  <input style={inputStyle} type={f.type||'text'} placeholder={f.placeholder} value={form[f.key]} onChange={handleChange(f.key)} />
                </div>
              ))}
              <div style={{ marginBottom:'20px' }}>
                <label style={labelStyle}>Company address</label>
                <textarea
                  style={{ ...inputStyle, height:'64px', resize:'none' }}
                  placeholder="Full address..."
                  value={form.address}
                  onChange={handleChange('address')}
                />
              </div>
              <button type="submit" disabled={loading} style={primaryBtn}>
                {loading ? 'Registering...' : 'Register & generate credentials'}
              </button>
            </form>
          ) : (
            <div>
              <div style={{ fontSize:'14px', fontWeight:500, marginBottom:'4px', color:'#27500A' }}>Registration successful!</div>
              <div style={{ fontSize:'12px', color:'#888', marginBottom:'16px' }}>Save these credentials — share with dept heads securely.</div>

              <div style={{ background:'#F8F8F6', borderRadius:'8px', padding:'14px', marginBottom:'16px' }}>
                <div style={{ fontSize:'11px', fontWeight:500, color:'#666', marginBottom:'10px', textTransform:'uppercase', letterSpacing:'0.04em' }}>Admin credentials</div>
                {[
                  { label:'Company ID', value: credentials.companyId },
                  { label:'Admin ID',   value: credentials.adminId },
                  { label:'Password',   value: credentials.adminPw },
                  { label:'Departments to set up', value: credentials.numDepts },
                ].map(row => (
                  <div key={row.label} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'6px' }}>
                    <span style={{ fontSize:'11px', color:'#888' }}>{row.label}</span>
                    <span style={{ fontSize:'13px', fontWeight:500, fontFamily:'monospace' }}>{row.value}</span>
                  </div>
                ))}
              </div>

              <div style={{ fontSize:'11px', color:'#888', background:'#FAEEDA', padding:'10px 12px', borderRadius:'8px', marginBottom:'16px', border:'0.5px solid #FAC775' }}>
                Next step: Login as admin → create your departments → share dept IDs with your department heads.
              </div>

              <button onClick={() => navigate('/login')} style={primaryBtn}>Go to login</button>
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

const labelStyle = { fontSize:'11px', fontWeight:500, color:'#666', display:'block', marginBottom:'4px', textTransform:'uppercase', letterSpacing:'0.04em' }
const inputStyle  = { width:'100%', padding:'9px 12px', fontSize:'13px', border:'0.5px solid rgba(0,0,0,0.2)', borderRadius:'8px', background:'#fff', fontFamily:'inherit', boxSizing:'border-box' }
const primaryBtn  = { width:'100%', padding:'10px', fontSize:'13px', fontWeight:500, background:'#378ADD', color:'#fff', border:'none', borderRadius:'8px', cursor:'pointer' }

export default RegisterPage
