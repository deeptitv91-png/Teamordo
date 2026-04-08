import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { getTasksByAssignee, updateTask, getTasksByDept } from '../../firebase/firestore'
import { getMembersByDept } from '../../firebase/firestore'
import TaskCard from '../../components/tasks/TaskCard'
import TaskForm from '../../components/tasks/TaskForm'
import { createTask } from '../../firebase/firestore'
import { canAddMembers, canGiveL1Approval } from '../../utils/roleDetector'
import Notify from '../../components/common/Notify'

const MyTasks = () => {
  const { user } = useAuth()
  const [tasks,   setTasks]   = useState([])
  const [members, setMembers] = useState([])
  const [showForm,setForm]    = useState(false)
  const [notify,  setNotify]  = useState(null)

  const loadTasks = async () => {
    // Load tasks I'm assigned to + tasks I created (for L2 approval)
    const assigned = await getTasksByAssignee(user.companyId, user.userId)
    const all      = await getTasksByDept(user.companyId, user.deptId)
    const created  = all.filter(t => t.assignedBy === user.userId && t.assignedTo !== user.userId)
    // Merge and deduplicate
    const map = {}
    ;[...assigned, ...created].forEach(t => { map[t.id] = t })
    setTasks(Object.values(map))
  }

  useEffect(() => {
    if (!user) return
    loadTasks()
    getMembersByDept(user.companyId, user.deptId).then(setMembers)
  }, [user])

  const handleAction = async (taskId, action) => {
    const updates = {}
    const msgs = {
      start:     'Task started.',
      submit:    'Completion requested — waiting for L1 approval.',
      l1approve: 'L1 approved. Waiting for task creator final approval.',
      l2approve: 'Task fully approved and marked done!',
      sendback:  'Task sent back for revision.',
      rework:    'Rework requested — assignee notified.',
    }
    if (action === 'start')     updates.status = 'inprogress'
    if (action === 'submit')    updates.status = 'l1_pending'
    if (action === 'l1approve') { updates.status = 'l2_pending'; updates.l1By = user.userId }
    if (action === 'l2approve') { updates.status = 'done';       updates.l2By = user.userId }
    if (action === 'sendback' || action === 'rework') { updates.status = 'inprogress'; updates.l1By = null }

    await updateTask(user.companyId, taskId, updates)
    setNotify({ msg: msgs[action], type: action === 'sendback' || action === 'rework' ? 'warn' : 'ok' })
    loadTasks()
  }

  const handleCreate = async (taskData) => {
    await createTask(user.companyId, taskData)
    setForm(false)
    setNotify({ msg:'Task created successfully.', type:'ok' })
    loadTasks()
  }

  const canCreate = canAddMembers(user?.category) || user?.role === 'dept_head'
  const myAssigned = tasks.filter(t => t.assignedTo === user?.userId)
  const myCreated  = tasks.filter(t => t.assignedBy === user?.userId && t.assignedTo !== user?.userId)

  return (
    <div>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'20px' }}>
        <div style={{ fontSize:'16px', fontWeight:500 }}>My tasks</div>
        {canCreate && !showForm && (
          <button onClick={() => setForm(true)} style={{ padding:'7px 14px', fontSize:'12px', fontWeight:500, background:'#378ADD', color:'#fff', border:'none', borderRadius:'8px', cursor:'pointer' }}>
            + New task
          </button>
        )}
      </div>

      {notify && <Notify message={notify.msg} type={notify.type} onDone={() => setNotify(null)} />}
      {showForm && <TaskForm members={members} currentUser={user} onSubmit={handleCreate} onCancel={() => setForm(false)} />}

      <div style={{ fontSize:'11px', fontWeight:500, color:'#888', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'10px' }}>
        Assigned to me ({myAssigned.length})
      </div>
      {myAssigned.length === 0 ? (
        <div style={{ fontSize:'12px', color:'#aaa', padding:'16px 0' }}>No tasks assigned to you.</div>
      ) : myAssigned.map(t => (
        <TaskCard key={t.id} task={t} currentUser={user} members={members} onAction={handleAction} />
      ))}

      {myCreated.length > 0 && (
        <>
          <div style={{ fontSize:'11px', fontWeight:500, color:'#888', textTransform:'uppercase', letterSpacing:'0.06em', margin:'20px 0 10px' }}>
            Tasks I created ({myCreated.length})
          </div>
          {myCreated.map(t => (
            <TaskCard key={t.id} task={t} currentUser={user} members={members} onAction={handleAction} />
          ))}
        </>
      )}
    </div>
  )
}

export default MyTasks
