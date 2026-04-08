import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { getMembersByDept, createUser, updateDoc, doc, getDoc } from '../../firebase/firestore'
import { createUserAccount } from '../../firebase/auth'
import { generateMemberId, generatePassword } from '../../utils/idGenerator'
import { db } from '../../firebase/config'
import { getDoc as fsGetDoc, updateDoc as fsUpdateDoc, doc as fsDoc, increment } from 'firebase/firestore'
import { getCategoryColor, canAddMembers } from '../../utils/roleDetector'
import Avatar from '../../components/common/Avatar'
import Badge from '../../components/common/Badge'
import Notify from '../../components/common/Notify'

const CATEGORIES = ['manager', 'lead', 'executive', 'trainee']

const MemberManager = () => {
  const { user } = useAuth()
  const [members, setMembers]     = useState([])
  const [notify, setNotify]       = useState(null)
  const [loading, setLoading]     = useState(false)
  const [lastGen, setLastGen]     = useState(null)
  const [form, setForm]           = useState({ name:'', email:'', designation:'', category:'executive' })

  const canAdd = user?.role === 'dept_head' || canAddMembers(user?.category)

  useEffect(() => {
    if (user?.deptId && user?.companyId) {
      getMembersByDept(user.companyId, user.deptId).then(setMembers)
    }
  }, [user])

  const handleAdd = async () => {
    if (!form.name || !form.email || !form.designation) {
      setNotify({ msg:'Please fill all fields.', type:'err' }); return
    }
    if (!canAdd) {
      setNotify({ msg:'Only Manager category can add members.', type:'err' }); return
    }
    setLoading(true)
    try {
      // Get current counter
      const compDoc = await fsGetDoc(fsDoc(db, 'companies', user.companyId))
      const counter = (compDoc.data()?.memberCounter || 0) + 1

      const memberId = generateMemberId(user.companyId, counter)
      const memberPw = generatePassword(form.name)

      await createUserAccount(memberId, memberPw, user.companyId, {
        name:        form.name,
        email:       form.email,
        designation: form.designation,
        category:    form.category,
        role:        'member',
        deptId:      user.deptId,
        companyId:   user.companyId,
        userId:      memberId,
      })

      // Increment counter
      await fsUpdateDoc(fsDoc(db, 'companies', user.companyId), { memberCounter: increment(1) })

      setLastGen({ memberId, memberPw, name: form.name, category: form.category })
      setForm({ name:'', email:'', designation:'', category:'executive' })
      setNotify({ msg: `${form.name} added. Credentials generated.`, type:'ok' })
      getMembersByDept(user.companyId, user.deptId).then(setMembers)
    } catch (err) {
      setNotify({ msg:'Failed: ' + err.message, type:'err' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div style={{ fontSize:'16px', fontWeight:500, marginBottom:'20px' }}>Team members</div>

      {notify && <Notify message={notify.msg} type={notify.type} onDone={() => setNotify(null)} />}

      {canAdd && (
        <div style={{ background:'#fff', border:'0.5px solid rgba(0,0,0,0.08)', borderRadius:'12px', padding:'16px', marginBottom:'16px' }}>
          <div style={{ fontSize:'13px', fontWeight:500, marginBottom:'12px' }}>Add team member</div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', marginBottom:'10px' }}>
            {[
              { key:'name',        label:'Full name',    placeholder:'e.g. Nisha S.' },
              { key:'email',       label:'Email',        placeholder:'nisha@company.com' },
              { key:'designation', label:'Designation',  placeholder:'e.g. Graphic Designer' },
            ].map(f => (
              <div key={f.key} style={{ gridColumn: f.key==='designation'?'span 1':'span 1' }}>
                <label style={labelStyle}>{f.label}</label>
                <input style={inputStyle} placeholder={f.placeholder} value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} />
              </div>
            ))}
            <div>
              <label style={labelStyle}>Category</label>
              <select style={inputStyle} value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase()+c.slice(1)}</option>)}
              </select>
            </div>
          </div>
          <button onClick={handleAdd} disabled={loading} style={{ padding:'8px 18px', fontSize:'13px', fontWeight:500, background:'#378ADD', color:'#fff', border:'none', borderRadius:'8px', cursor:'pointer' }}>
            {loading ? 'Adding...' : 'Add member & generate credentials'}
          </button>
          <div style={{ fontSize:'11px', color:'#888', marginTop:'8px' }}>Only Manager category members can add new members.</div>
        </div>
      )}

      {/* Last generated */}
      {lastGen && (
        <div style={{ background:'#EAF3DE', border:'0.5px solid #97C459', borderRadius:'10px', padding:'14px', marginBottom:'16px' }}>
          <div style={{ fontSize:'12px', fontWeight:500, color:'#27500A', marginBottom:'8px' }}>Credentials for {lastGen.name} — share privately</div>
          <div style={{ display:'flex', gap:'20px', flexWrap:'wrap' }}>
            <div><span style={{ fontSize:'11px', color:'#3B6D11' }}>Member ID</span><br/><span style={{ fontFamily:'monospace', fontWeight:500 }}>{lastGen.memberId}</span></div>
            <div><span style={{ fontSize:'11px', color:'#3B6D11' }}>Password</span><br/><span style={{ fontFamily:'monospace', fontWeight:500 }}>{lastGen.memberPw}</span></div>
            <div><span style={{ fontSize:'11px', color:'#3B6D11' }}>Category</span><br/><span style={{ fontWeight:500 }}>{lastGen.category}</span></div>
          </div>
        </div>
      )}

      {/* Member list */}
      <div style={{ background:'#fff', border:'0.5px solid rgba(0,0,0,0.08)', borderRadius:'12px', padding:'16px' }}>
        {members.length === 0 ? (
          <div style={{ fontSize:'12px', color:'#aaa', textAlign:'center', padding:'24px 0' }}>No members yet.</div>
        ) : members.map(m => {
          const c = getCategoryColor(m.category)
          const initials = m.name.split(' ').map(w=>w[0]).join('').substring(0,2).toUpperCase()
          return (
            <div key={m.userId} style={{ display:'flex', alignItems:'center', gap:'10px', padding:'10px 0', borderBottom:'0.5px solid rgba(0,0,0,0.06)' }}>
              <Avatar initials={initials} bg={c.bg} tx={c.tx} />
              <div style={{ flex:1 }}>
                <div style={{ fontSize:'13px', fontWeight:500 }}>{m.name}</div>
                <div style={{ fontSize:'11px', color:'#888' }}>{m.designation} · <span style={{ fontFamily:'monospace' }}>{m.userId}</span></div>
              </div>
              <Badge label={c.label} color={c.bg} textColor={c.tx} />
            </div>
          )
        })}
      </div>
    </div>
  )
}

const labelStyle = { fontSize:'11px', fontWeight:500, color:'#666', display:'block', marginBottom:'4px', textTransform:'uppercase', letterSpacing:'0.04em' }
const inputStyle  = { width:'100%', padding:'8px 10px', fontSize:'13px', border:'0.5px solid rgba(0,0,0,0.2)', borderRadius:'8px', fontFamily:'inherit', boxSizing:'border-box' }

export default MemberManager
