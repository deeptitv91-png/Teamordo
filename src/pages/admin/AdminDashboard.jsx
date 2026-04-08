import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useCompany } from '../../context/CompanyContext'
import { getDepartments, getMembersByDept } from '../../firebase/firestore'
import { generateDeptId, generatePassword } from '../../utils/idGenerator'
import { createDepartment, createUser } from '../../firebase/firestore'
import { createUserAccount } from '../../firebase/auth'
import Notify from '../../components/common/Notify'
import Badge from '../../components/common/Badge'

const AdminDashboard = () => {
  const { user } = useAuth()
  const { company, departments, setDepts } = useCompany()
  const [newDeptName, setNewDeptName] = useState('')
  const [loading, setLoading]         = useState(false)
  const [notify, setNotify]           = useState(null)
  const [lastGenerated, setLastGen]   = useState(null)

  const addDepartment = async () => {
    if (!newDeptName.trim()) return
    setLoading(true)
    try {
      const idx    = departments.length + 1
      const deptId = generateDeptId(newDeptName, idx)
      const deptPw = generatePassword(newDeptName)
      const headId = deptId  // Dept head logs in with DEPT-xxx ID

      await createDepartment(user.companyId, deptId, {
        name: newDeptName.trim(),
        deptId,
        password: deptPw,
        memberCount: 0,
        companyId: user.companyId,
      })

      // Create dept head user account
      await createUserAccount(headId, deptPw, user.companyId, {
        name: newDeptName + ' Head',
        role: 'dept_head',
        deptId,
        companyId: user.companyId,
        userId: headId,
        category: 'manager',
      })

      const updated = await getDepartments(user.companyId)
      setDepts(updated)
      setLastGen({ deptId, deptPw, name: newDeptName })
      setNewDeptName('')
      setNotify({ msg: `Department "${newDeptName}" created. Credentials generated.`, type:'ok' })
    } catch (err) {
      setNotify({ msg: 'Failed: ' + err.message, type:'err' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div style={{ marginBottom:'24px' }}>
        <div style={{ fontSize:'20px', fontWeight:500 }}>{company?.name}</div>
        <div style={{ fontSize:'13px', color:'#888', marginTop:'2px' }}>Admin dashboard</div>
      </div>

      {notify && <Notify message={notify.msg} type={notify.type} onDone={() => setNotify(null)} />}

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(130px,1fr))', gap:'10px', marginBottom:'24px' }}>
        {[
          { label:'Departments', value: departments.length },
          { label:'Target depts', value: company?.numDepts || '—' },
          { label:'Company ID', value: user?.companyId },
        ].map(m => (
          <div key={m.label} style={{ background:'#fff', border:'0.5px solid rgba(0,0,0,0.08)', borderRadius:'10px', padding:'14px' }}>
            <div style={{ fontSize:'11px', color:'#888', marginBottom:'4px' }}>{m.label}</div>
            <div style={{ fontSize:'16px', fontWeight:500, fontFamily: m.label==='Company ID'?'monospace':'inherit' }}>{m.value}</div>
          </div>
        ))}
      </div>

      {/* Add department */}
      <div style={{ background:'#fff', border:'0.5px solid rgba(0,0,0,0.08)', borderRadius:'12px', padding:'16px', marginBottom:'16px' }}>
        <div style={{ fontSize:'13px', fontWeight:500, marginBottom:'12px' }}>Add department</div>
        <div style={{ display:'flex', gap:'8px' }}>
          <input
            style={{ flex:1, padding:'9px 12px', fontSize:'13px', border:'0.5px solid rgba(0,0,0,0.2)', borderRadius:'8px', fontFamily:'inherit' }}
            placeholder="Department name, e.g. Creative, Engineering, Marketing..."
            value={newDeptName}
            onChange={e => setNewDeptName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addDepartment()}
          />
          <button onClick={addDepartment} disabled={loading} style={{ padding:'9px 18px', fontSize:'13px', fontWeight:500, background:'#378ADD', color:'#fff', border:'none', borderRadius:'8px', cursor:'pointer' }}>
            {loading ? '...' : 'Add'}
          </button>
        </div>
      </div>

      {/* Last generated credentials */}
      {lastGenerated && (
        <div style={{ background:'#EAF3DE', border:'0.5px solid #97C459', borderRadius:'10px', padding:'14px', marginBottom:'16px' }}>
          <div style={{ fontSize:'12px', fontWeight:500, color:'#27500A', marginBottom:'8px' }}>New department credentials — share with dept head</div>
          <div style={{ display:'flex', gap:'24px', flexWrap:'wrap' }}>
            <div><span style={{ fontSize:'11px', color:'#3B6D11' }}>Department</span><br/><span style={{ fontSize:'13px', fontWeight:500 }}>{lastGenerated.name}</span></div>
            <div><span style={{ fontSize:'11px', color:'#3B6D11' }}>Dept ID (login)</span><br/><span style={{ fontSize:'13px', fontWeight:500, fontFamily:'monospace' }}>{lastGenerated.deptId}</span></div>
            <div><span style={{ fontSize:'11px', color:'#3B6D11' }}>Password</span><br/><span style={{ fontSize:'13px', fontWeight:500, fontFamily:'monospace' }}>{lastGenerated.deptPw}</span></div>
          </div>
        </div>
      )}

      {/* Departments list with credentials */}
      <div style={{ background:'#fff', border:'0.5px solid rgba(0,0,0,0.08)', borderRadius:'12px', padding:'16px' }}>
        <div style={{ fontSize:'13px', fontWeight:500, marginBottom:'4px' }}>All departments</div>
        <div style={{ fontSize:'11px', color:'#888', marginBottom:'14px' }}>Credentials are only visible here. Share securely with each dept head.</div>
        {departments.length === 0 ? (
          <div style={{ fontSize:'12px', color:'#aaa', textAlign:'center', padding:'20px 0' }}>No departments yet. Add one above.</div>
        ) : departments.map(d => (
          <div key={d.deptId} style={{ padding:'12px 0', borderBottom:'0.5px solid rgba(0,0,0,0.06)' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'6px' }}>
              <div style={{ fontSize:'13px', fontWeight:500 }}>{d.name}</div>
              <Badge label="Active" color="#EAF3DE" textColor="#27500A" />
            </div>
            <div style={{ display:'flex', gap:'20px', flexWrap:'wrap' }}>
              <div style={{ fontSize:'11px', color:'#888' }}>Dept ID: <span style={{ fontFamily:'monospace', color:'#1a1a1a', fontWeight:500 }}>{d.deptId}</span></div>
              <div style={{ fontSize:'11px', color:'#888' }}>Password: <span style={{ fontFamily:'monospace', color:'#1a1a1a', fontWeight:500 }}>{d.password}</span></div>
              <div style={{ fontSize:'11px', color:'#888' }}>Members: {d.memberCount || 0}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default AdminDashboard
