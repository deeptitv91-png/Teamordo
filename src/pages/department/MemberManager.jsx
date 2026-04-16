import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { getMembersByDept, createUser, getCompany } from '../../firebase/firestore'
import { createUserAccount } from '../../firebase/auth'
import { generateMemberId, generatePassword } from '../../utils/idGenerator'
import { getCategoryColor } from '../../utils/roleDetector'
import { doc, deleteDoc, updateDoc, increment } from 'firebase/firestore'
import { db } from '../../firebase/config'
import Notify from '../../components/common/Notify'

const MemberManager = () => {
  const { user } = useAuth()
  const [members,  setMembers]  = useState([])
  const [notify,   setNotify]   = useState(null)
  const [loading,  setLoading]  = useState(false)
  const [confirm,  setConfirm]  = useState(null)
  const [form,     setForm]     = useState({ name:'', email:'', designation:'', category:'executive' })
  const [creds,    setCreds]    = useState(null)

  const loadMembers = async () => {
    const list = await getMembersByDept(user.companyId, user.deptId)
    setMembers(list)
  }

  useEffect(() => { if (user) loadMembers() }, [user])

  const handleAdd = async (e) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.designation) {
      setNotify({ msg:'Please fill all fields.', type:'err' }); return
    }
    setLoading(true)
    try {
      const company = await getCompany(user.companyId)
      const counter = (company?.memberCounter || 0) + 1
      const memberId = generateMemberId(user.companyId, counter)
      const password = generatePassword(form.name)

      await createUserAccount(memberId, password, user.companyId, {
        name:        form.name,
        email:       form.email,
        designation: form.designation,
        category:    form.category,
        role:        'member',
        companyId:   user.companyId,
        deptId:      user.deptId,
        userId:      memberId,
      })

      await updateDoc(doc(db, 'companies', user.companyId), { memberCounter: increment(1) })

      setCreds({ memberId, password, name: form.name })
      setForm({ name:'', email:'', designation:'', category:'executive' })
      setNotify({ msg:'Member added successfully!', type:'ok' })
      loadMembers()
    } catch (err) {
      setNotify({ msg:'Failed: ' + err.message, type:'err' })
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = async (memberId, name) => {
    try {
      await deleteDoc(doc(db, 'companies', user.companyId, 'users', memberId))
      setConfirm(null)
      setNotify({ msg:`${name} has been removed.`, type:'ok' })
      loadMembers()
    } catch (err) {
      setNotify({ msg:'Failed to remove: ' + err.message, type:'err' })
    }
  }

  const initials = (name) => name?.split(' ').map(w=>w[0]).join('').substring(0,2).toUpperCase() || '??'

  return (
    <div>
      <div style={{ fontSize:'16px', fontWeight:500, marginBottom:'20px' }}>Team members</div>

      {notify && <Notify message={notify.msg} type={notify.type} onDone={() => setNotify(null)} />}

      {/* Credentials popup */}
      {creds && (
        <div style={{ background:'#EAF3DE', border:'0.5px solid #97C459', borderRadius:'12px', padding:'16px', marginBottom:'16px' }}>
          <div style={{ fontSize:'13px', fontWeight:500, color:'#27500A', marginBottom:'10px' }}>Member added! Share these credentials:</div>
          {[
            { label:'Member ID', value: creds.memberId },
            { label:'Password',  value: creds.password },
          ].map(r => (
            <div key={r.label} style={{ display:'flex', justifyContent:'space-between', marginBottom:'6px' }}>
              <span style={{ fontSize:'12px', color:'#555' }}>{r.label}</span>
              <span style={{ fontSize:'13px', fontWeight:600, fontFamily:'monospace' }}>{r.value}</span>
            </div>
          ))}
          <div style={{ fontSize:'11px', color:'#555', marginTop:'8px' }}>
            Login URL: <strong>teamordo.com/{user.deptId?.toLowerCase()}</strong>
          </div>
          <button onClick={() => setCreds(null)} style={{ marginTop:'10px', fontSize:'11px', background:'none', border:'0.5px solid #97C459', borderRadius:'6px', padding:'4px 12px', cursor:'pointer', color:'#27500A' }}>
            Dismiss
          </button>
        </div>
      )}

      {/* Add member form */}
      <div style={{ background:'#fff', border:'0.5px solid rgba(0,0,0,0.08)', borderRadius:'12px', padding:'16px', marginBottom:'20px' }}>
        <div style={{ fontSize:'13px', fontWeight:500, marginBottom:'12px' }}>Add team member</div>
        <form onSubmit={handleAdd}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', marginBottom:'10px' }}>
            <div>
              <label style={lbl}>Full name</label>
              <input style={inp} placeholder="e.g. Nisha S." value={form.name} onChange={e => setForm(p=>({...p,name:e.target.value}))} />
            </div>
            <div>
              <label style={lbl}>Email</label>
              <input style={inp} type="email" placeholder="nisha@company.com" value={form.email} onChange={e => setForm(p=>({...p,email:e.target.value}))} />
            </div>
            <div>
              <label style={lbl}>Designation</label>
              <input style={inp} placeholder="e.g. Graphic Designer" value={form.designation} onChange={e => setForm(p=>({...p,designation:e.target.value}))} />
            </div>
            <div>
              <label style={lbl}>Category</label>
              <select style={inp} value={form.category} onChange={e => setForm(p=>({...p,category:e.target.value}))}>
                <option value="manager">Manager</option>
                <option value="lead">Lead</option>
                <option value="executive">Executive</option>
                <option value="trainee">Trainee</option>
              </select>
            </div>
          </div>
          <button type="submit" disabled={loading} style={{ padding:'8px 18px', fontSize:'13px', fontWeight:500, background:'#378ADD', color:'#fff', border:'none', borderRadius:'8px', cursor:'pointer', opacity:loading?0.7:1 }}>
            {loading ? 'Adding...' : 'Add member & generate credentials'}
          </button>
          <div style={{ fontSize:'11px', color:'#888', marginTop:'8px' }}>Only Manager category members can add new members.</div>
        </form>
      </div>

      {/* Members list */}
      <div style={{ fontSize:'11px', fontWeight:500, color:'#888', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'10px' }}>
        Team ({members.length})
      </div>

      {members.length === 0 ? (
        <div style={{ fontSize:'12px', color:'#aaa', padding:'20px 0' }}>No members yet. Add your first team member above.</div>
      ) : members.map(m => {
        const sc = getCategoryColor(m.category)
        return (
          <div key={m.userId} style={{ display:'flex', alignItems:'center', gap:'10px', padding:'12px 14px', background:'#fff', border:'0.5px solid rgba(0,0,0,0.08)', borderRadius:'10px', marginBottom:'8px' }}>
            <div style={{ width:'36px', height:'36px', borderRadius:'50%', background:sc.bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'13px', fontWeight:600, color:sc.tx, flexShrink:0 }}>
              {initials(m.name)}
            </div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:'14px', fontWeight:500 }}>{m.name}</div>
              <div style={{ fontSize:'11px', color:'#888' }}>{m.designation} · {m.userId}</div>
            </div>
            <span style={{ fontSize:'11px', padding:'3px 10px', borderRadius:'20px', background:sc.bg, color:sc.tx, fontWeight:500 }}>
              {sc.label}
            </span>
            <button
              onClick={() => setConfirm(m)}
              style={{ padding:'5px 12px', fontSize:'11px', borderRadius:'6px', cursor:'pointer', fontFamily:'inherit', background:'#FCEBEB', color:'#791F1F', border:'0.5px solid #F09595' }}
            >
              Remove
            </button>
          </div>
        )
      })}

      {/* Confirm remove modal */}
      {confirm && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.4)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:200 }}>
          <div style={{ background:'#fff', borderRadius:'14px', padding:'28px', width:'100%', maxWidth:'360px', margin:'20px' }}>
            <div style={{ fontSize:'15px', fontWeight:600, marginBottom:'8px' }}>Remove member?</div>
            <div style={{ fontSize:'13px', color:'#666', marginBottom:'20px' }}>
              Are you sure you want to remove <strong>{confirm.name}</strong>? They will lose access immediately.
            </div>
            <div style={{ display:'flex', gap:'10px' }}>
              <button onClick={() => handleRemove(confirm.userId, confirm.name)} style={{ flex:1, padding:'10px', fontSize:'13px', fontWeight:500, background:'#791F1F', color:'#fff', border:'none', borderRadius:'8px', cursor:'pointer' }}>
                Yes, remove
              </button>
              <button onClick={() => setConfirm(null)} style={{ flex:1, padding:'10px', fontSize:'13px', background:'none', border:'0.5px solid rgba(0,0,0,0.15)', borderRadius:'8px', cursor:'pointer' }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const lbl = { fontSize:'11px', fontWeight:500, color:'#666', display:'block', marginBottom:'4px', textTransform:'uppercase', letterSpacing:'0.04em' }
const inp = { width:'100%', padding:'8px 10px', fontSize:'13px', border:'0.5px solid rgba(0,0,0,0.2)', borderRadius:'8px', fontFamily:'inherit', boxSizing:'border-box' }

export default MemberManager
