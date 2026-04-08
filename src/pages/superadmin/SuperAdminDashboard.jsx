import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore'
import { db } from '../../firebase/config'
import { signOut } from 'firebase/auth'
import { auth } from '../../firebase/config'

const SuperAdminDashboard = () => {
  const [companies, setCompanies] = useState([])
  const [loading,   setLoading]   = useState(true)
  const [stats,     setStats]     = useState({ total:0, active:0, suspended:0, totalUsers:0 })
  const [notify,    setNotify]    = useState(null)
  const [search,    setSearch]    = useState('')
  const navigate = useNavigate()

  const loadCompanies = async () => {
    setLoading(true)
    try {
      const snap = await getDocs(collection(db, 'companies'))
      const list = await Promise.all(snap.docs.map(async d => {
        const data = d.data()
        const usersSnap = await getDocs(collection(db, 'companies', d.id, 'users'))
        const deptsSnap = await getDocs(collection(db, 'companies', d.id, 'departments'))
        const tasksSnap = await getDocs(collection(db, 'companies', d.id, 'tasks'))
        return {
          id: d.id, ...data,
          userCount: usersSnap.size,
          deptCount: deptsSnap.size,
          taskCount: tasksSnap.size,
          status: data.status || 'active',
        }
      }))
      setCompanies(list)
      setStats({
        total:      list.length,
        active:     list.filter(c => c.status === 'active').length,
        suspended:  list.filter(c => c.status === 'suspended').length,
        totalUsers: list.reduce((a, c) => a + c.userCount, 0),
      })
    } catch (err) {
      setNotify({ msg:'Error: ' + err.message, type:'err' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadCompanies() }, [])

  const toggleStatus = async (companyId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active'
    await updateDoc(doc(db, 'companies', companyId), { status: newStatus })
    setNotify({ msg:`Company ${newStatus}.`, type: newStatus==='active'?'ok':'warn' })
    loadCompanies()
  }

  const deleteCompany = async (companyId, name) => {
    if (!window.confirm(`DELETE "${name}"? This cannot be undone.`)) return
    await deleteDoc(doc(db, 'companies', companyId))
    setNotify({ msg:`"${name}" deleted.`, type:'err' })
    loadCompanies()
  }

  const handleLogout = async () => {
    await signOut(auth)
    navigate('/superadmin/login')
  }

  const filtered = companies.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.id?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div style={{ minHeight:'100vh', background:'#0f0f1a', color:'#e0e0e0', fontFamily:'system-ui,sans-serif' }}>
      <div style={{ background:'#1a1a2e', borderBottom:'1px solid #2a2a4a', padding:'14px 24px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
          <span style={{ fontSize:'18px', fontWeight:600, color:'#fff' }}>Team<span style={{ color:'#378ADD' }}>ordo</span></span>
          <span style={{ fontSize:'11px', background:'#378ADD', color:'#fff', padding:'2px 10px', borderRadius:'20px' }}>Super Admin</span>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
          <span style={{ fontSize:'12px', color:'#666' }}>mail.deeptitv@gmail.com</span>
          <button onClick={handleLogout} style={{ padding:'5px 12px', fontSize:'12px', background:'transparent', border:'1px solid #444', borderRadius:'6px', color:'#aaa', cursor:'pointer' }}>Logout</button>
        </div>
      </div>

      <div style={{ padding:'24px' }}>
        {notify && (
          <div style={{ padding:'10px 14px', borderRadius:'8px', marginBottom:'16px', fontSize:'13px', background:'#1a2a1a', color:'#4ade80', border:'1px solid #166534', display:'flex', justifyContent:'space-between' }}>
            {notify.msg}
            <span onClick={() => setNotify(null)} style={{ cursor:'pointer' }}>×</span>
          </div>
        )}

        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))', gap:'12px', marginBottom:'24px' }}>
          {[
            { label:'Total companies', value:stats.total,      color:'#378ADD' },
            { label:'Active',          value:stats.active,     color:'#4ade80' },
            { label:'Suspended',       value:stats.suspended,  color:'#f87171' },
            { label:'Total users',     value:stats.totalUsers, color:'#a78bfa' },
          ].map(s => (
            <div key={s.label} style={{ background:'#1a1a2e', border:'1px solid #2a2a4a', borderRadius:'10px', padding:'16px' }}>
              <div style={{ fontSize:'11px', color:'#666', marginBottom:'4px' }}>{s.label}</div>
              <div style={{ fontSize:'26px', fontWeight:600, color:s.color }}>{s.value}</div>
            </div>
          ))}
        </div>

        <div style={{ display:'flex', gap:'10px', marginBottom:'16px' }}>
          <input
            style={{ flex:1, padding:'9px 14px', fontSize:'13px', background:'#1a1a2e', border:'1px solid #2a2a4a', borderRadius:'8px', color:'#e0e0e0', fontFamily:'inherit' }}
            placeholder="Search company name or ID..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <button onClick={loadCompanies} style={{ padding:'9px 16px', fontSize:'12px', background:'#378ADD', color:'#fff', border:'none', borderRadius:'8px', cursor:'pointer' }}>Refresh</button>
        </div>

        <div style={{ background:'#1a1a2e', border:'1px solid #2a2a4a', borderRadius:'12px', overflow:'hidden' }}>
          <div style={{ padding:'12px 16px', borderBottom:'1px solid #2a2a4a', fontSize:'12px', color:'#666' }}>
            {filtered.length} companies
          </div>
          {loading ? (
            <div style={{ padding:'40px', textAlign:'center', color:'#666' }}>Loading...</div>
          ) : filtered.length === 0 ? (
            <div style={{ padding:'40px', textAlign:'center', color:'#666' }}>No companies found.</div>
          ) : filtered.map((c, i) => (
            <div key={c.id} style={{ display:'flex', alignItems:'center', gap:'12px', padding:'14px 16px', borderBottom: i < filtered.length-1 ? '1px solid #1e1e3a' : 'none', flexWrap:'wrap' }}>
              <div style={{ width:'36px', height:'36px', borderRadius:'50%', background:'#2a2a4a', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'14px', fontWeight:600, color:'#378ADD', flexShrink:0 }}>
                {c.name?.charAt(0).toUpperCase()}
              </div>
              <div style={{ flex:1, minWidth:'150px' }}>
                <div style={{ fontSize:'14px', fontWeight:500, color:'#fff' }}>{c.name}</div>
                <div style={{ fontSize:'11px', color:'#555', fontFamily:'monospace' }}>{c.id}</div>
                <div style={{ fontSize:'11px', color:'#555' }}>{c.adminEmail}</div>
              </div>
              <div style={{ display:'flex', gap:'16px', fontSize:'12px' }}>
                <div style={{ textAlign:'center' }}><div style={{ color:'#378ADD', fontWeight:600 }}>{c.deptCount}</div><div style={{ color:'#555' }}>depts</div></div>
                <div style={{ textAlign:'center' }}><div style={{ color:'#a78bfa', fontWeight:600 }}>{c.userCount}</div><div style={{ color:'#555' }}>users</div></div>
                <div style={{ textAlign:'center' }}><div style={{ color:'#4ade80', fontWeight:600 }}>{c.taskCount}</div><div style={{ color:'#555' }}>tasks</div></div>
              </div>
              <span style={{ fontSize:'11px', padding:'3px 10px', borderRadius:'20px', fontWeight:500, background:c.status==='active'?'#14532d':'#7f1d1d', color:c.status==='active'?'#4ade80':'#f87171' }}>
                {c.status === 'active' ? 'Active' : 'Suspended'}
              </span>
              <div style={{ fontSize:'11px', color:'#555' }}>{c.createdAt?.toDate?.()?.toLocaleDateString() || '—'}</div>
              <div style={{ display:'flex', gap:'6px' }}>
                <button onClick={() => toggleStatus(c.id, c.status)} style={{ padding:'5px 12px', fontSize:'11px', borderRadius:'6px', cursor:'pointer', fontFamily:'inherit', background:c.status==='active'?'#3a1a1a':'#1a3a1a', color:c.status==='active'?'#f87171':'#4ade80', border:`1px solid ${c.status==='active'?'#7f1d1d':'#166534'}` }}>
                  {c.status === 'active' ? 'Suspend' : 'Activate'}
                </button>
                <button onClick={() => deleteCompany(c.id, c.name)} style={{ padding:'5px 12px', fontSize:'11px', borderRadius:'6px', cursor:'pointer', fontFamily:'inherit', background:'#3a1a1a', color:'#f87171', border:'1px solid #7f1d1d' }}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default SuperAdminDashboard
