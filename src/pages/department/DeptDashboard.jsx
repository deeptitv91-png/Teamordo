import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { getTasksByDept, getMembersByDept, updateTask, createTask } from '../../firebase/firestore'
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore'
import { db } from '../../firebase/config'
import TaskCard from '../../components/tasks/TaskCard'
import TaskForm from '../../components/tasks/TaskForm'
import { isOverdue } from '../../utils/dateHelpers'
import Notify from '../../components/common/Notify'
import WorkUpload from '../member/WorkUpload'

const TABS = ['Overview', 'Tasks', 'Uploads']

const DeptDashboard = () => {
  const { user }  = useAuth()
  const [tab,     setTab]     = useState('Overview')
  const [tasks,   setTasks]   = useState([])
  const [members, setMembers] = useState([])
  const [showForm,setForm]    = useState(false)
  const [notify,  setNotify]  = useState(null)

  const loadData = async () => {
    const t = await getTasksByDept(user.companyId, user.deptId)
    const m = await getMembersByDept(user.companyId, user.deptId)
    setTasks(t)
    setMembers(m)
  }

  useEffect(() => { if (user) loadData() }, [user])

  const handleAction = async (taskId, action) => {
    const updates = {}
    if (action === 'start')     updates.status = 'inprogress'
    if (action === 'submit')    updates.status = 'l1_pending'
    if (action === 'l1approve') { updates.status = 'l2_pending'; updates.l1By = user.userId }
    if (action === 'l2approve') { updates.status = 'done';       updates.l2By = user.userId }
    if (action === 'sendback' || action === 'rework') { updates.status = 'inprogress'; updates.l1By = null }
    await updateTask(user.companyId, taskId, updates)
    const msgs = { l1approve:'L1 approved.', l2approve:'Task marked done!', sendback:'Sent back for revision.', rework:'Rework requested.' }
    setNotify({ msg: msgs[action] || 'Updated.', type: action.includes('approve') ? 'ok' : 'warn' })
    loadData()
  }

  const handleCreate = async (data) => {
    await createTask(user.companyId, { ...data, deptId: user.deptId })
    setForm(false)
    setNotify({ msg:'Task created.', type:'ok' })
    loadData()
  }

  // Stats
  const total    = tasks.length
  const done     = tasks.filter(t => t.status === 'done').length
  const delayed  = tasks.filter(t => isOverdue(t.deadline, t.status)).length
  const pending  = tasks.filter(t => t.status === 'l1_pending' || t.status === 'l2_pending').length

  return (
    <div>
      <div style={{ marginBottom:'20px' }}>
        <div style={{ fontSize:'16px', fontWeight:500 }}>Department dashboard</div>
        <div style={{ fontSize:'12px', color:'#888', marginTop:'2px' }}>{user?.deptId}</div>
      </div>

      {notify && <Notify message={notify.msg} type={notify.type} onDone={() => setNotify(null)} />}

      {/* Tabs */}
      <div style={{ display:'flex', gap:'4px', borderBottom:'0.5px solid rgba(0,0,0,0.08)', marginBottom:'20px' }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding:'8px 16px', fontSize:'13px', border:'none', background:'none',
            color: tab===t ? '#1a1a1a' : '#888',
            fontWeight: tab===t ? 500 : 400,
            borderBottom: `2px solid ${tab===t ? '#378ADD' : 'transparent'}`,
            cursor:'pointer', fontFamily:'inherit',
          }}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'Overview' && (
        <>
          {/* Stats */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(120px,1fr))', gap:'10px', marginBottom:'24px' }}>
            {[
              { label:'Members',  value: members.length },
              { label:'Tasks',    value: total },
              { label:'Done',     value: done,    sub: total ? `${Math.round(done/total*100)}%` : '—' },
              { label:'Delayed',  value: delayed, alert: delayed > 0 },
              { label:'Pending approvals', value: pending, alert: pending > 0 },
            ].map(m => (
              <div key={m.label} style={{ background:'#fff', border:`0.5px solid ${m.alert && m.value > 0 ? '#E24B4A' : 'rgba(0,0,0,0.08)'}`, borderRadius:'10px', padding:'14px' }}>
                <div style={{ fontSize:'11px', color:'#888', marginBottom:'4px' }}>{m.label}</div>
                <div style={{ fontSize:'22px', fontWeight:500, color: m.alert && m.value > 0 ? '#791F1F' : 'inherit' }}>{m.value}</div>
                {m.sub && <div style={{ fontSize:'11px', color:'#888' }}>{m.sub} completion</div>}
              </div>
            ))}
          </div>

          {/* Pending approvals */}
          {pending > 0 && (
            <>
              <div style={{ fontSize:'11px', fontWeight:500, color:'#888', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'10px' }}>
                Needs your approval ({pending})
              </div>
              {tasks.filter(t => t.status === 'l1_pending' || t.status === 'l2_pending').map(t => (
                <TaskCard key={t.id} task={t} currentUser={user} members={members} onAction={handleAction} />
              ))}
            </>
          )}

          {/* Members overview */}
          <div style={{ fontSize:'11px', fontWeight:500, color:'#888', textTransform:'uppercase', letterSpacing:'0.06em', margin:'20px 0 10px' }}>
            Team ({members.length})
          </div>
          <div style={{ background:'#fff', border:'0.5px solid rgba(0,0,0,0.08)', borderRadius:'12px', overflow:'hidden' }}>
            {members.map((m, i) => {
              const myTasks = tasks.filter(t => t.assignedTo === m.userId)
              const myDone  = myTasks.filter(t => t.status === 'done').length
              const myDelay = myTasks.filter(t => isOverdue(t.deadline, t.status)).length
              return (
                <div key={m.userId} style={{ display:'flex', alignItems:'center', gap:'10px', padding:'11px 16px', borderBottom: i < members.length-1 ? '0.5px solid rgba(0,0,0,0.06)' : 'none' }}>
                  <div style={{ width:'28px', height:'28px', borderRadius:'50%', background: m.bg || '#E6F1FB', color: m.tx || '#0C447C', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'10px', fontWeight:500 }}>
                    {m.name.split(' ').map(w=>w[0]).join('').substring(0,2).toUpperCase()}
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:'13px', fontWeight:500 }}>{m.name}</div>
                    <div style={{ fontSize:'11px', color:'#888' }}>{m.designation} · {m.category}</div>
                  </div>
                  <div style={{ fontSize:'12px', color:'#888' }}>{myDone}/{myTasks.length} tasks</div>
                  {myDelay > 0 && <span style={{ fontSize:'10px', padding:'2px 7px', borderRadius:'20px', background:'#FCEBEB', color:'#791F1F' }}>{myDelay} delayed</span>}
                </div>
              )
            })}
          </div>
        </>
      )}

      {tab === 'Tasks' && (
        <>
          <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:'12px' }}>
            {!showForm && (
              <button onClick={() => setForm(true)} style={{ padding:'7px 14px', fontSize:'12px', fontWeight:500, background:'#378ADD', color:'#fff', border:'none', borderRadius:'8px', cursor:'pointer' }}>
                + New task
              </button>
            )}
          </div>
          {showForm && <TaskForm members={members} currentUser={user} onSubmit={handleCreate} onCancel={() => setForm(false)} />}
          {tasks.length === 0 ? (
            <div style={{ fontSize:'12px', color:'#aaa', padding:'20px 0' }}>No tasks yet.</div>
          ) : tasks.map(t => (
            <TaskCard key={t.id} task={t} currentUser={user} members={members} onAction={handleAction} />
          ))}
        </>
      )}

      {tab === 'Uploads' && <WorkUpload viewAll={true} />}
    </div>
  )
}

export default DeptDashboard
