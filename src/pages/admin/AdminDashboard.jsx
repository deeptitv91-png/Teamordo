import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { getCompany, getDepartments, createDepartment, getTasksByDept, createTask, updateTask } from '../../firebase/firestore'
import { createUserAccount } from '../../firebase/auth'
import { generateDeptId, generatePassword } from '../../utils/idGenerator'
import { collection, getDocs, doc, updateDoc, increment } from 'firebase/firestore'
import { db } from '../../firebase/config'
import TaskCard from '../../components/tasks/TaskCard'
import TaskForm from '../../components/tasks/TaskForm'
import Notify from '../../components/common/Notify'

const AdminDashboard = () => {
  const { user }     = useAuth()
  const [company,    setCompany]    = useState(null)
  const [depts,      setDepts]      = useState([])
  const [deptHeads,  setDeptHeads]  = useState([])
  const [tasks,      setTasks]      = useState([])
  const [tab,        setTab]        = useState('overview')
  const [deptName,   setDeptName]   = useState('')
  const [adding,     setAdding]     = useState(false)
  const [showForm,   setForm]       = useState(false)
  const [notify,     setNotify]     = useState(null)

  const loadData = async () => {
    if (!user) return
    const [comp, deptList] = await Promise.all([
      getCompany(user.companyId),
      getDepartments(user.companyId),
    ])
    setCompany(comp)
    setDepts(deptList)

    // Load all dept heads
    const snap = await getDocs(collection(db, 'companies', user.companyId, 'users'))
    const allUsers = snap.docs.map(d => d.data())
    setDeptHeads(allUsers.filter(u => u.role === 'dept_head'))

    // Load all tasks
    const allTasks = await getTasksByDept(user.companyId, null)
    setTasks(allTasks)
  }

  useEffect(() => { loadData() }, [user])

  const DEPT_LIMITS = { free:1, starter:5, growth:10, enterprise:99999 }

  const handleAddDept = async () => {
    if (!deptName.trim()) return
    // Check plan limit
    const plan = company?.plan || 'free'
    const limit = DEPT_LIMITS[plan] || 1
    if (depts.length >= limit) {
      setNotify({ msg:`Your ${plan} plan allows up to ${limit} department(s). Please upgrade your plan to add more departments.`, type:'err' }); return
    }
    setAdding(true)
    try {
      const counter = (company?.deptCounter || 0) + 1
      const deptId  = generateDeptId(deptName, counter)
      const password = generatePassword(deptName)

      await createDepartment(user.companyId, deptId, {
        name:      deptName,
        deptId,
        companyId: user.companyId,
        status:    'active',
      })

      await createUserAccount(deptId, password, user.companyId, {
        name:      deptName + ' Head',
        role:      'dept_head',
        companyId: user.companyId,
        deptId,
        userId:    deptId,
        category:  'manager',
        password:  password,
      })

      await updateDoc(doc(db, 'companies', user.companyId), { deptCounter: increment(1) })

      setDeptName('')
      setNotify({ msg:`Department "${deptName}" created!`, type:'ok' })
      loadData()
    } catch (err) {
      setNotify({ msg:'Failed: ' + err.message, type:'err' })
    } finally {
      setAdding(false)
    }
  }

  const handleAction = async (taskId, action, reason = '') => {
    const updates = {}
    if (action === 'l1approve')   { updates.status = 'l2_pending'; updates.l1By = user.userId }
    if (action === 'l2approve')   { updates.status = 'done'; updates.l2By = user.userId; updates.rejectReason = '' }
    if (action === 'sendback')    { updates.status = 'inprogress'; updates.l1By = null; updates.rejectReason = reason; updates.rejectedBy = user.userId }
    if (action === 'l2_sendback') { updates.status = 'inprogress'; updates.l1By = null; updates.rejectReason = reason; updates.rejectedBy = user.userId }
    await updateTask(user.companyId, taskId, updates)
    setNotify({ msg: action.includes('approve') ? 'Approved!' : 'Sent back.', type: action.includes('approve') ? 'ok' : 'warn' })
    loadData()
  }

  const handleCreate = async (taskData) => {
    await createTask(user.companyId, taskData)
    setForm(false)
    setNotify({ msg:'Task assigned to dept head!', type:'ok' })
    loadData()
  }

  return (
    <div>
      <div style={{ marginBottom:'20px' }}>
        <div style={{ fontSize:'18px', fontWeight:500 }}>{company?.name}</div>
        <div style={{ fontSize:'12px', color:'#888' }}>Admin dashboard · {user?.userId}</div>
      </div>

      {notify && <Notify message={notify.msg} type={notify.type} onDone={() => setNotify(null)} />}

      {/* Tabs */}
      <div style={{ display:'flex', gap:'0', borderBottom:'0.5px solid rgba(0,0,0,0.1)', marginBottom:'20px' }}>
        {['overview','departments','tasks'].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding:'10px 18px', fontSize:'13px', background:'none', border:'none',
            borderBottom: tab===t ? '2px solid #378ADD' : '2px solid transparent',
            color: tab===t ? '#378ADD' : '#888', cursor:'pointer', fontFamily:'inherit',
            textTransform:'capitalize',
          }}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Overview */}
      {tab === 'overview' && (
        <div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:'12px', marginBottom:'20px' }}>
            {[
              { label:'Departments',  value: depts.length,                         color:'#378ADD' },
              { label:'Target depts', value: company?.numDepts || 0,               color:'#888'    },
              { label:'Company ID',   value: user?.companyId,                      color:'#1a1a1a', small:true },
              { label:'Total tasks',  value: tasks.length,                         color:'#8B7FD4' },
            ].map(s => (
              <div key={s.label} style={{ background:'#fff', border:'0.5px solid rgba(0,0,0,0.08)', borderRadius:'10px', padding:'14px' }}>
                <div style={{ fontSize:'11px', color:'#888', marginBottom:'4px' }}>{s.label}</div>
                <div style={{ fontSize: s.small ? '13px' : '24px', fontWeight:600, color:s.color, fontFamily: s.small ? 'monospace' : 'inherit' }}>{s.value}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Departments */}
      {tab === 'departments' && (
        <div>
          <div style={{ background:'#fff', border:'0.5px solid rgba(0,0,0,0.08)', borderRadius:'12px', padding:'16px', marginBottom:'20px' }}>
            <div style={{ fontSize:'13px', fontWeight:500, marginBottom:'12px' }}>Add department</div>
            <div style={{ display:'flex', gap:'10px' }}>
              <input
                style={{ flex:1, padding:'9px 12px', fontSize:'13px', border:'0.5px solid rgba(0,0,0,0.2)', borderRadius:'8px', fontFamily:'inherit' }}
                placeholder="Department name, e.g. Creative, Engineering, Marketing..."
                value={deptName}
                onChange={e => setDeptName(e.target.value)}
                onKeyDown={e => e.key==='Enter' && handleAddDept()}
              />
              <button onClick={handleAddDept} disabled={adding} style={{ padding:'9px 18px', fontSize:'13px', fontWeight:500, background:'#378ADD', color:'#fff', border:'none', borderRadius:'8px', cursor:'pointer', whiteSpace:'nowrap' }}>
                {adding ? 'Adding...' : 'Add'}
              </button>
            </div>
          </div>

          <div style={{ fontSize:'11px', fontWeight:500, color:'#888', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'10px' }}>
            All departments ({depts.length})
          </div>
          <div style={{ fontSize:'12px', color:'#888', marginBottom:'12px' }}>Credentials are only visible here. Share securely with each dept head.</div>

          {depts.map(d => {
            const head = deptHeads.find(h => h.deptId === d.id)
            return (
              <div key={d.id} style={{ background:'#fff', border:'0.5px solid rgba(0,0,0,0.08)', borderRadius:'10px', padding:'14px 16px', marginBottom:'8px', display:'flex', alignItems:'center', gap:'16px', flexWrap:'wrap' }}>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:'14px', fontWeight:500 }}>{d.name}</div>
                  <div style={{ fontSize:'11px', color:'#888', marginTop:'4px', display:'flex', gap:'16px', flexWrap:'wrap' }}>
                    <span>Dept ID: <strong style={{ fontFamily:'monospace' }}>{d.id}</strong></span>
                    {head && <span>Password: <strong style={{ fontFamily:'monospace' }}>{head.password || '—'}</strong></span>}
                  </div>
                </div>
                <span style={{ fontSize:'11px', padding:'3px 10px', borderRadius:'20px', background:'#EAF3DE', color:'#27500A', fontWeight:500 }}>Active</span>
              </div>
            )
          })}
        </div>
      )}

      {/* Tasks — admin assigns to dept heads */}
      {tab === 'tasks' && (
        <div>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'14px' }}>
            <div>
              <div style={{ fontSize:'14px', fontWeight:500 }}>Assign tasks to department heads</div>
              <div style={{ fontSize:'12px', color:'#888', marginTop:'2px' }}>You can assign tasks directly to any department head.</div>
            </div>
            {!showForm && (
              <button onClick={() => setForm(true)} style={{ padding:'7px 14px', fontSize:'12px', fontWeight:500, background:'#378ADD', color:'#fff', border:'none', borderRadius:'8px', cursor:'pointer' }}>
                + New task
              </button>
            )}
          </div>
          {showForm && (
            <TaskForm
              members={deptHeads}
              currentUser={user}
              onSubmit={handleCreate}
              onCancel={() => setForm(false)}
            />
          )}
          {tasks.length === 0 ? (
            <div style={{ fontSize:'12px', color:'#aaa', padding:'16px 0' }}>No tasks yet.</div>
          ) : tasks.map(t => (
            <TaskCard key={t.id} task={t} currentUser={user} members={[...deptHeads]} onAction={handleAction} />
          ))}
        </div>
      )}
    </div>
  )
}

export default AdminDashboard
