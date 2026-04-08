import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import {
  createUpload, updateUpload, getUploadsByMember,
  getTasksByDept, getMembersByDept
} from '../../firebase/firestore'
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore'
import { db } from '../../firebase/config'
import { uploadFile } from '../../firebase/storage'
import UploadZone from '../../components/uploads/UploadZone'
import SubmissionList from '../../components/uploads/SubmissionList'
import Notify from '../../components/common/Notify'

const WorkUpload = ({ viewAll = false }) => {
  const { user } = useAuth()
  const [uploads,   setUploads]   = useState([])
  const [tasks,     setTasks]     = useState([])
  const [members,   setMembers]   = useState([])
  const [selectedTask, setTask]   = useState('')
  const [notes,     setNotes]     = useState('')
  const [file,      setFile]      = useState(null)
  const [fileType,  setFileType]  = useState('')
  const [progress,  setProgress]  = useState(0)
  const [uploading, setUploading] = useState(false)
  const [notify,    setNotify]    = useState(null)

  const loadUploads = async () => {
    if (viewAll) {
      // Dept head sees all dept uploads
      const q = query(
        collection(db, 'companies', user.companyId, 'uploads'),
        where('deptId', '==', user.deptId),
        orderBy('createdAt', 'desc')
      )
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
    getTasksByDept(user.companyId, user.deptId).then(myTasks => {
      // Only show tasks assigned to this member
      const mine = viewAll ? myTasks : myTasks.filter(t => t.assignedTo === user.userId)
      setTasks(mine)
    })
  }, [user, viewAll])

  const handleFileSelected = (f, type) => {
    setFile(f)
    setFileType(type)
    setNotify({ msg: `${f.name} selected (${type}). Fill in details and submit.`, type:'info' })
  }

  const handleSubmit = async () => {
    if (!file || !selectedTask) {
      setNotify({ msg:'Please select a task and a file.', type:'err' })
      return
    }
    setUploading(true)
    setProgress(0)
    try {
      const { url, path, filename } = await uploadFile(
        file,
        user.companyId,
        user.deptId,
        user.userId,
        setProgress
      )

      const task = tasks.find(t => t.id === selectedTask)
      await createUpload(user.companyId, {
        taskId:      selectedTask,
        taskTitle:   task?.title || selectedTask,
        fileName:    filename,
        fileUrl:     url,
        filePath:    path,
        fileType:    fileType,
        fileSize:    file.size,
        submittedBy: user.userId,
        deptId:      user.deptId,
        companyId:   user.companyId,
        reviewNote:  '',
        reviewedBy:  null,
        notes,
      })

      setFile(null)
      setNotes('')
      setTask('')
      setProgress(0)
      setNotify({ msg:'Work submitted successfully. Waiting for review.', type:'ok' })
      loadUploads()
    } catch (err) {
      setNotify({ msg:'Upload failed: ' + err.message, type:'err' })
    } finally {
      setUploading(false)
    }
  }

  const handleAction = async (uploadId, newStatus, note) => {
    await updateUpload(user.companyId, uploadId, {
      status:     newStatus,
      reviewNote: note,
      reviewedBy: newStatus === 'review' ? null : user.userId,
    })

    const statusMsg = {
      approved:   'Work approved!',
      correction: 'Correction requested — member notified to resubmit.',
      rework:     'Rework requested — member notified to redo.',
      review:     'Work resubmitted for review.',
    }
    setNotify({ msg: statusMsg[newStatus] || 'Updated.', type: newStatus === 'approved' ? 'ok' : 'warn' })
    loadUploads()
  }

  return (
    <div>
      <div style={{ fontSize:'16px', fontWeight:500, marginBottom:'20px' }}>
        {viewAll ? 'All work submissions' : 'Upload work'}
      </div>

      {notify && <Notify message={notify.msg} type={notify.type} onDone={() => setNotify(null)} />}

      {!viewAll && (
        <div style={{ background:'#fff', border:'0.5px solid rgba(0,0,0,0.08)', borderRadius:'12px', padding:'16px', marginBottom:'16px' }}>
          <div style={{ fontSize:'13px', fontWeight:500, marginBottom:'12px' }}>Submit work</div>

          <div style={{ marginBottom:'12px' }}>
            <label style={lbl}>Select task</label>
            <select style={inp} value={selectedTask} onChange={e => setTask(e.target.value)}>
              <option value="">Choose a task...</option>
              {tasks.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
            </select>
          </div>

          <div style={{ marginBottom:'12px' }}>
            <label style={lbl}>Upload file</label>
            <UploadZone onFileSelected={handleFileSelected} disabled={uploading} />
            {file && (
              <div style={{ fontSize:'11px', color:'#378ADD', marginTop:'6px' }}>
                Selected: {file.name} ({fileType}) — {(file.size / 1024 / 1024).toFixed(1)}MB
              </div>
            )}
          </div>

          {progress > 0 && progress < 100 && (
            <div style={{ marginBottom:'12px' }}>
              <div style={{ fontSize:'11px', color:'#888', marginBottom:'4px' }}>Uploading... {progress}%</div>
              <div style={{ height:'4px', background:'#eee', borderRadius:'2px' }}>
                <div style={{ height:'4px', width:`${progress}%`, background:'#378ADD', borderRadius:'2px', transition:'width 0.2s' }} />
              </div>
            </div>
          )}

          <div style={{ marginBottom:'12px' }}>
            <label style={lbl}>Notes (optional)</label>
            <input style={inp} placeholder="Brief description of your submission..." value={notes} onChange={e => setNotes(e.target.value)} />
          </div>

          <button
            onClick={handleSubmit}
            disabled={uploading || !file || !selectedTask}
            style={{
              padding:'8px 18px', fontSize:'13px', fontWeight:500,
              background: (!file || !selectedTask) ? '#ccc' : '#378ADD',
              color:'#fff', border:'none', borderRadius:'8px',
              cursor: (!file || !selectedTask) ? 'not-allowed' : 'pointer',
            }}
          >
            {uploading ? `Uploading ${progress}%...` : 'Submit for review'}
          </button>
        </div>
      )}

      <div style={{ fontSize:'11px', fontWeight:500, color:'#888', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'10px' }}>
        {viewAll ? `All submissions (${uploads.length})` : `My submissions (${uploads.length})`}
      </div>

      <SubmissionList
        uploads={uploads}
        members={members}
        currentUser={user}
        onAction={handleAction}
        readOnly={false}
      />
    </div>
  )
}

const lbl = { fontSize:'11px', fontWeight:500, color:'#666', display:'block', marginBottom:'4px', textTransform:'uppercase', letterSpacing:'0.04em' }
const inp = { width:'100%', padding:'8px 10px', fontSize:'13px', border:'0.5px solid rgba(0,0,0,0.2)', borderRadius:'8px', fontFamily:'inherit', boxSizing:'border-box' }

export default WorkUpload
