import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import {
  getDepartments, createDepartment, getMembersByDept,
  getTasksByDept, createTask, updateTask
} from '../../firebase/firestore'
import { createUserAccount } from '../../firebase/auth'
import { generateDeptId, generatePassword } from '../../utils/idGenerator'
import { collection, getDocs, doc, updateDoc, increment } from 'firebase/firestore'
import { db } from '../../firebase/config'
import TaskCard from '../../components/tasks/TaskCard'
import TaskForm from '../../components/tasks/TaskForm'
import Notify from '../../components/common/Notify'
import Badge from '../../components/common/Badge'

const DeptDashboard = () => {
  const { user }   = useAuth()
  const [tab,      setTab]      = useState('overview')
  const [tasks,    setTasks]    = useState([])
  const [members,  setMembers]  = useState([])
  const [myTasks,  setMyTasks]  = useState([])
  const [showForm, setForm]     = useState(false)
  const [notify,   setNotify]   = useState(null)
  const [taskFilter, setFilter] = useState('all')

  const loadData = async () => {
    if (!user) return
    const [allTasks, allMembers] = await Promise.all([
      getTasksByDept(user.companyId, user.deptId),
      getMembersByDept(user.companyId, user.deptId),
    ])
    setTasks(allTasks)
    setMembers(allMembers)
    // Tasks assigned to dept head himself
    setMyTasks(allTasks.filter(t => t.assignedTo === user.userId))
  }

  useEffect(() => { loadData() }, [user])

  const handleAction = async (taskId, action, reason = '') => {
    const updates = {}
    if (action === 'start')       updates.status = 'inprogress'
    if (action === 'submit')      updates.status = 'l1_pending'
    if (action === 'l1approve')   { updates.status = 'l2_pending'; updates.l1By = user.userId }
    if (action === 'l2approve')   { updates.status = 'done'; updates.l2By = user.userId; updates.rejectReason = '' }
    if (action === 'sendback')    { updates.status = 'inprogress'; updates.l1By = null; updates.rejectReason = reason; updates.rejectedBy = user.userId }
    if (action === 'l2_sendback') { updates.status = 'inprogress'; updates.l1By = null; updates.l2By = null; updates.rejectReason = reason; updates.rejectedBy = user.userId }

    await updateTask(user.companyId, taskId, updates)
    const msgs = { start:'Started!', submit:'Submitted for approval.', l1approve:'L1 approved!', l2approve:'Task done!', sendback:'Sent back.', l2_sendback:'Sent back.' }
    setNotify({ msg: msgs[action], type: action.includes('sendback') ? 'warn' : 'ok' })
    loadData()
  }

  const handleCreate = async (taskData) => {
    await createTask(user.companyId, taskData)
    setForm(false)
    setNotify({ msg:'Task created!', type:'ok' })
    loadData()
  }

  const filters = ['all','todo','inprogress','l1_pending','l2_pending','done']
  const filterLabels = { all:'All', todo:'To do', inprogress:'In progress', l1_pending:'Awaiting L1', l2_pending:'Awaiting L2', done:'Done' }

  const filteredTasks = tasks.filter(t => taskFilter === 'all' || t.status === taskFilter)

  // Dept head can assign to himself + his members
  const assignableMembers = [
    { ...user, name: user?.name + ' (me)', userId: user?.userId },
    ...members
  ]

  const stats = {
    total:      tasks.length,
    inprogress: tasks.filter(t => t.status === 'inprogress').length,
    pending:    tasks.filter(t => ['l1_pending','l2_pending'].includes(t.status)).length,
    done:       tasks.filter(t => t.status === 'done').length,
  }

  return (
    <div>
      <div style={{ marginBottom:'20px' }}>
        <div style={{ fontSize:'18px', fontWeight:500 }}>{user?.name?.replace(' Admin','')}</div>
        <div style={{ fontSize:'12px', color:'#888' }}>Department dashboard · {user?.deptId}</div>
      </div>

      {notify && <Notify message={notify.msg} type={notify.type} onDone={() => setNotify(null)} />}

      {/* Tabs */}
      <div style={{ display:'flex', gap:'0', borderBottom:'0.5px solid rgba(0,0,0,0.1)', marginBottom:'20px' }}>
        {['overview','tasks','my-tasks','uploads'].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding:'10px 18px', fontSize:'13px', background:'none', border:'none',
            borderBottom: tab===t ? '2px solid #378ADD' : '2px solid transparent',
            color: tab===t ? '#378ADD' : '#888', cursor:'pointer', fontFamily:'inherit',
            textTransform:'capitalize',
          }}>
            {t === 'my-tasks' ? 'My tasks' : t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Overview */}
      {tab === 'overview' && (
        <div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))', gap:'12px', marginBottom:'20px' }}>
            {[
              { label:'Total tasks',  value:stats.total,      color:'#378ADD' },
              { label:'In progress',  value:stats.inprogress, color:'#EF9F27' },
              { label:'Pending',      value:stats.pending,    color:'#8B7FD4' },
              { label:'Done',         value:stats.done,       color:'#97C459' },
              { label:'Members',      value:members.length,   color:'#1a1a1a' },
            ].map(s => (
              <div key={s.label} style={{ background:'#fff', border:'0.5px solid rgba(0,0,0,0.08)', borderRadius:'10px', padding:'14px' }}>
                <div style={{ fontSize:'11px', color:'#888', marginBottom:'4px' }}>{s.label}</div>
                <div style={{ fontSize:'24px', fontWeight:600, color:s.color }}>{s.value}</div>
              </div>
            ))}
          </div>
          <div style={{ fontSize:'12px', color:'#888' }}>Use the Tasks tab to create and manage tasks. Use My tasks tab to see tasks assigned to you.</div>
        </div>
      )}

      {/* All Tasks */}
      {tab === 'tasks' && (
        <div>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'14px' }}>
            <div style={{ fontSize:'14px', fontWeight:500 }}>Department tasks</div>
            {!showForm && (
              <button onClick={() => setForm(true)} style={{ padding:'7px 14px', fontSize:'12px', fontWeight:500, background:'#378ADD', color:'#fff', border:'none', borderRadius:'8px', cursor:'pointer' }}>
                + New task
              </button>
            )}
          </div>
          {showForm && <TaskForm members={assignableMembers} currentUser={user} onSubmit={handleCreate} onCancel={() => setForm(false)} />}
          <div style={{ display:'flex', gap:'6px', flexWrap:'wrap', marginBottom:'14px' }}>
            {filters.map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{
                padding:'4px 12px', fontSize:'11px', borderRadius:'20px', cursor:'pointer', fontFamily:'inherit',
                background: taskFilter===f ? '#1a1a1a' : 'transparent',
                color: taskFilter===f ? '#fff' : '#666',
                border: taskFilter===f ? 'none' : '0.5px solid rgba(0,0,0,0.15)',
              }}>
                {filterLabels[f]}
              </button>
            ))}
          </div>
          {filteredTasks.length === 0 ? (
            <div style={{ fontSize:'12px', color:'#aaa', padding:'16px 0' }}>No tasks found.</div>
          ) : filteredTasks.map(t => (
            <TaskCard key={t.id} task={t} currentUser={user} members={[...members, user]} onAction={handleAction} />
          ))}
        </div>
      )}

      {/* My Tasks — tasks assigned to dept head */}
      {tab === 'my-tasks' && (
        <div>
          <div style={{ fontSize:'14px', fontWeight:500, marginBottom:'14px' }}>Tasks assigned to me</div>
          {myTasks.length === 0 ? (
            <div style={{ fontSize:'12px', color:'#aaa', padding:'16px 0' }}>No tasks assigned to you yet.</div>
          ) : myTasks.map(t => (
            <TaskCard key={t.id} task={t} currentUser={user} members={[...members, user]} onAction={handleAction} />
          ))}
        </div>
      )}

      {/* Uploads */}
      {tab === 'uploads' && (
        <div style={{ fontSize:'13px', color:'#888' }}>
          Go to <strong>Work uploads</strong> in the sidebar to see all submissions.
        </div>
      )}
    </div>
  )
}

export default DeptDashboard
