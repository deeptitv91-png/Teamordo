import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { getTasksByDept, updateTask, createTask, getMembersByDept } from '../../firebase/firestore'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../../firebase/config'
import TaskCard from '../../components/tasks/TaskCard'
import TaskForm from '../../components/tasks/TaskForm'
import Notify from '../../components/common/Notify'

const AllTasks = () => {
  const { user }  = useAuth()
  const [tasks,    setTasks]   = useState([])
  const [members,  setMembers] = useState([])
  const [allUsers, setAllUsers]= useState([])
  const [filter,   setFilter]  = useState('all')
  const [showForm, setForm]    = useState(false)
  const [notify,   setNotify]  = useState(null)

  const isDeptHead = user?.role === 'dept_head'
  const isAdmin    = user?.role === 'admin'
  const isManager  = ['manager','lead'].includes(user?.category)
  const canAct     = isDeptHead || isManager

  const loadData = async () => {
    if (!user) return
    // Load tasks
    const allTasks = await getTasksByDept(user.companyId, isDeptHead || !isAdmin ? user.deptId : null)
    setTasks(allTasks)

    // Load members
    if (isDeptHead) {
      const deptMembers = await getMembersByDept(user.companyId, user.deptId)
      setMembers(deptMembers)
    }

    // Load all users for name resolution
    const snap = await getDocs(collection(db, 'companies', user.companyId, 'users'))
    setAllUsers(snap.docs.map(d => d.data()))
  }

  useEffect(() => { loadData() }, [user])

  const handleAction = async (taskId, action, reason = '') => {
    const updates = {}
    const msgs = {
      start:      'Task started.',
      submit:     'Submitted for L1 approval.',
      l1approve:  'L1 approved!',
      l2approve:  'Task fully approved and done!',
      sendback:   'Task sent back with reason.',
      l2_sendback:'Task sent back with reason.',
    }
    if (action === 'start')      updates.status = 'inprogress'
    if (action === 'submit')     updates.status = 'l1_pending'
    if (action === 'l1approve')  { updates.status = 'l2_pending'; updates.l1By = user.userId }
    if (action === 'l2approve')  { updates.status = 'done'; updates.l2By = user.userId; updates.rejectReason = '' }
    if (action === 'sendback')   { updates.status = 'inprogress'; updates.l1By = null; updates.rejectReason = reason; updates.rejectedBy = user.userId }
    if (action === 'l2_sendback'){ updates.status = 'inprogress'; updates.l1By = null; updates.l2By = null; updates.rejectReason = reason; updates.rejectedBy = user.userId }

    await updateTask(user.companyId, taskId, updates)
    setNotify({ msg: msgs[action], type: action.includes('sendback') ? 'warn' : 'ok' })
    loadData()
  }

  const handleCreate = async (taskData) => {
    await createTask(user.companyId, taskData)
    setForm(false)
    setNotify({ msg:'Task created!', type:'ok' })
    loadData()
  }

  const filters = ['all', 'todo', 'inprogress', 'l1_pending', 'l2_pending', 'done']
  const filterLabels = { all:'All', todo:'To do', inprogress:'In progress', l1_pending:'Awaiting L1', l2_pending:'Awaiting L2', done:'Done' }

  const filtered = tasks.filter(t => filter === 'all' || t.status === filter)

  // Dept head can assign to himself + his members
  // Members for task form — exclude dept heads
  const assignableMembers = isDeptHead
    ? [{ ...user, name: user.name + ' (me)' }, ...members]
    : members.filter(m => m.role === 'member')

  return (
    <div>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'16px' }}>
        <div>
          <div style={{ fontSize:'16px', fontWeight:500 }}>All tasks</div>
          {!canAct && <div style={{ fontSize:'12px', color:'#888', marginTop:'2px' }}>Read-only view. Login with your own ID to take actions.</div>}
        </div>
        {canAct && !showForm && (
          <button onClick={() => setForm(true)} style={{ padding:'7px 14px', fontSize:'12px', fontWeight:500, background:'#378ADD', color:'#fff', border:'none', borderRadius:'8px', cursor:'pointer' }}>
            + New task
          </button>
        )}
      </div>

      {notify && <Notify message={notify.msg} type={notify.type} onDone={() => setNotify(null)} />}

      {showForm && canAct && (
        <TaskForm members={assignableMembers} currentUser={user} onSubmit={handleCreate} onCancel={() => setForm(false)} />
      )}

      {/* Filters */}
      <div style={{ display:'flex', gap:'6px', flexWrap:'wrap', marginBottom:'16px' }}>
        {filters.map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding:'5px 14px', fontSize:'12px', borderRadius:'20px', cursor:'pointer', fontFamily:'inherit',
            background: filter === f ? '#1a1a1a' : 'transparent',
            color: filter === f ? '#fff' : '#666',
            border: filter === f ? 'none' : '0.5px solid rgba(0,0,0,0.15)',
          }}>
            {filterLabels[f]}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div style={{ fontSize:'12px', color:'#aaa', padding:'20px 0' }}>No tasks found.</div>
      ) : filtered.map(t => (
        <TaskCard
          key={t.id}
          task={t}
          currentUser={canAct ? user : null}
          members={allUsers}
          onAction={handleAction}
        />
      ))}
    </div>
  )
}

export default AllTasks
