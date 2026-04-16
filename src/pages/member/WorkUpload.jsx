import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { createUpload, updateUpload, updateTask, getUploadsByMember, getTasksByDept, getMembersByDept } from '../../firebase/firestore'
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore'
import { db } from '../../firebase/config'
import UploadZone from '../../components/uploads/UploadZone'
import SubmissionList from '../../components/uploads/SubmissionList'
import Notify from '../../components/common/Notify'

const WorkUpload = ({ viewAll = false }) => {
  const { user }  = useAuth()
  const [uploads,      setUploads]      = useState([])
  const [tasks,        setTasks]        = useState([])
  const [members,      setMembers]      = useState([])
  const [selectedTask, setSelectedTask] = useState('')
  const [notify,       setNotify]       = useState(null)
  const [submitting,   setSubmitting]   = useState(false)

  const loadUploads = async () => {
    if (viewAll) {
      const q = query(collection(db, 'companies', user.companyId, 'uploads'), where('deptId', '==', user.deptId), orderBy('createdAt', 'desc'))
      const snap = await getDocs(q)
      setUploads(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    } else {
      const mine = await getUploadsByMember(user.companyId, user.userId)
      setUploads(mine)
    }
  }

  useEffect(() => {
    if (!user) return
    loadUploads()
    getMembersByDept(user.companyId, user.deptId).then(setMembers)
    getTasksByDept(user.companyId, user.deptId).then(allTasks => {
      const mine = viewAll ? allTasks : allTasks.filter(t => t.assignedTo === user.userId)
      setTasks(mine)
    })
  }, [user, viewAll])

  const handleLinkSubmit = async ({ link, title }) => {
    if (!selectedTask) { setNotify({ msg:'Please select a task first.', type:'err' }); return }
    setSubmitting(true)
    try {
      const task = tasks.find(t => t.id === selectedTask)
      await createUpload(user.companyId, {
        taskId:      selectedTask,
        taskTitle:   task?.title || selectedTask,
        workTitle:   title,
        workLink:    link,
        submittedBy: user.userId,
        deptId:      user.deptId,
        companyId:   user.companyId,
        reviewNote:  '',
        reviewedBy:  null,
      })

      // Also save work link directly on the task so everyone can see it
      await updateTask(user.companyId, selectedTask, {
        workLink:    link,
        workTitle:   title,
        workSubmittedBy: user.userId,
      })
      setSelectedTask('')
      setNotify({ msg:'Work submitted! Your reviewer will be notified.', type:'ok' })
      loadUploads()
    } catch (err) {
      setNotify({ msg:'Failed: ' + err.message, type:'err' })
    } finally {
      setSubmitting(false)
    }
  }

  const handleAction = async (uploadId, newStatus, note) => {
    await updateUpload(user.companyId, uploadId, {
      status:     newStatus,
      reviewNote: note,
      reviewedBy: newStatus === 'review' ? null : user.userId,
    })
    const msgs = { approved:'Work approved!', correction:'Correction requested — member will resubmit.', rework:'Rework requested — member will redo.', review:'Resubmitted for review.' }
    setNotify({ msg: msgs[newStatus], type: newStatus==='approved'||newStatus==='review'?'ok':'warn' })
    loadUploads()
  }

  return (
    <div>
      <div style={{ fontSize:'16px', fontWeight:500, marginBottom:'20px' }}>
        {viewAll ? 'All work submissions' : 'Submit work'}
      </div>

      {notify && <Notify message={notify.msg} type={notify.type} onDone={() => setNotify(null)} />}

      {!viewAll && (
        <div style={{ background:'#fff', border:'0.5px solid rgba(0,0,0,0.08)', borderRadius:'12px', padding:'16px', marginBottom:'16px' }}>
          <div style={{ fontSize:'13px', fontWeight:500, marginBottom:'12px' }}>Submit your work</div>
          <div style={{ marginBottom:'14px' }}>
            <label style={lbl}>Select task</label>
            <select style={inp} value={selectedTask} onChange={e => setSelectedTask(e.target.value)}>
              <option value="">Choose a task...</option>
              {tasks.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
            </select>
          </div>
          <UploadZone onLinkSubmitted={handleLinkSubmit} disabled={submitting} />
        </div>
      )}

      <div style={{ fontSize:'11px', fontWeight:500, color:'#888', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'10px' }}>
        {viewAll ? `All submissions (${uploads.length})` : `My submissions (${uploads.length})`}
      </div>
      <SubmissionList uploads={uploads} members={members} currentUser={user} onAction={handleAction} readOnly={false} />
    </div>
  )
}

const lbl = { fontSize:'11px', fontWeight:500, color:'#666', display:'block', marginBottom:'4px', textTransform:'uppercase', letterSpacing:'0.04em' }
const inp = { width:'100%', padding:'8px 10px', fontSize:'13px', border:'0.5px solid rgba(0,0,0,0.2)', borderRadius:'8px', fontFamily:'inherit', boxSizing:'border-box' }

export default WorkUpload
