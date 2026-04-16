import { useState } from 'react'
import { getStatusMeta, getCategoryColor, canGiveL1Approval } from '../../utils/roleDetector'
import { formatDate } from '../../utils/dateHelpers'
import Badge from '../common/Badge'

const TaskCard = ({ task, currentUser, members, onAction }) => {
  const [showRejectForm, setShowRejectForm] = useState(false)
  const [rejectReason,   setRejectReason]   = useState('')
  const [rejectType,     setRejectType]     = useState('') // 'l1_sendback' | 'l2_sendback'

  const status   = getStatusMeta(task.status)
  const assignee = members?.find(m => m.userId === task.assignedTo)
  const creator  = members?.find(m => m.userId === task.assignedBy)

  const isAssignee  = currentUser?.userId === task.assignedTo
  const isCreator   = currentUser?.userId === task.assignedBy || currentUser?.role === 'dept_head'
  const isL1Capable = canGiveL1Approval(currentUser?.category) || currentUser?.role === 'dept_head'

  const canStart      = isAssignee && task.status === 'todo'
  const canSubmit     = isAssignee && task.status === 'inprogress'
  const canL1Approve  = isL1Capable && !isAssignee && task.status === 'l1_pending'
  const canL1Sendback = isL1Capable && !isAssignee && task.status === 'l1_pending'
  const canL2Approve  = isCreator && task.status === 'l2_pending'
  const canL2Sendback = isCreator && task.status === 'l2_pending'

  const initials = (name) => name?.split(' ').map(w=>w[0]).join('').substring(0,2).toUpperCase() || '??'

  const handleSendback = (type) => {
    setRejectType(type)
    setShowRejectForm(true)
    setRejectReason('')
  }

  const handleRejectSubmit = () => {
    if (!rejectReason.trim()) return
    if (rejectType === 'l1_sendback') onAction(task.id, 'sendback', rejectReason)
    if (rejectType === 'l2_sendback') onAction(task.id, 'l2_sendback', rejectReason)
    setShowRejectForm(false)
    setRejectReason('')
  }

  const isOverdue = task.deadline && new Date(task.deadline) < new Date() && task.status !== 'done'

  return (
    <div style={{
      background:'#fff',
      border: `0.5px solid ${task.status==='done' ? '#97C459' : isOverdue ? '#E24B4A' : 'rgba(0,0,0,0.08)'}`,
      borderLeftWidth: '3px',
      borderLeftColor: task.status==='done' ? '#97C459' : task.status==='inprogress' ? '#378ADD' : task.status==='l1_pending' ? '#EF9F27' : task.status==='l2_pending' ? '#8B7FD4' : isOverdue ? '#E24B4A' : '#ddd',
      borderRadius:'10px',
      padding:'14px 16px',
      marginBottom:'10px',
    }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'flex-start', gap:'10px', marginBottom:'10px' }}>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:'14px', fontWeight:500, color:'#1a1a1a', marginBottom:'3px' }}>{task.title}</div>
          <div style={{ fontSize:'11px', color:'#aaa', display:'flex', gap:'10px', flexWrap:'wrap' }}>
            {assignee && <span>→ {assignee.name}</span>}
            {creator && currentUser?.userId !== task.assignedBy && <span>by {creator.name}</span>}
            {task.deadline && (
              <span style={{ color: isOverdue ? '#E24B4A' : '#aaa' }}>
                {isOverdue ? '⚠ Overdue: ' : 'Due: '}{task.deadline}
              </span>
            )}
          </div>
        </div>
        <Badge label={status.label} color={status.color} textColor={status.text} />
      </div>

      {/* Work submission link — visible to everyone */}
      {task.workLink && (
        <div style={{ marginBottom:'10px' }}>
          <div style={{ fontSize:'11px', fontWeight:600, color:'#0C447C', marginBottom:'4px', textTransform:'uppercase', letterSpacing:'0.04em' }}>
            Work submitted{task.workTitle ? ': ' + task.workTitle : ''}
          </div>
          
            href={task.workLink}
            target="_blank"
            rel="noreferrer"
            style={{
              display:'inline-flex', alignItems:'center', gap:'5px',
              fontSize:'12px', color:'#378ADD',
              background:'#E6F1FB', padding:'5px 14px',
              borderRadius:'6px', textDecoration:'none', fontWeight:500,
            }}
          >
            View work &rarr;
          </a>
        </div>
      )}

      {/* Rejection reason — show if task was sent back */}
      {task.rejectReason && (task.status === 'inprogress' || task.status === 'todo') && (
        <div style={{
          background:'#FEF2F2', border:'0.5px solid #F09595',
          borderRadius:'8px', padding:'10px 12px', marginBottom:'10px',
        }}>
          <div style={{ fontSize:'11px', fontWeight:600, color:'#791F1F', marginBottom:'3px', textTransform:'uppercase', letterSpacing:'0.04em' }}>
            Sent back — reason:
          </div>
          <div style={{ fontSize:'13px', color:'#791F1F' }}>{task.rejectReason}</div>
          {task.rejectedBy && (
            <div style={{ fontSize:'11px', color:'#999', marginTop:'4px' }}>
              — {members?.find(m => m.userId === task.rejectedBy)?.name || 'Reviewer'}
            </div>
          )}
        </div>
      )}

      {/* Reject reason form */}
      {showRejectForm && (
        <div style={{ background:'#FEF2F2', border:'0.5px solid #F09595', borderRadius:'8px', padding:'12px', marginBottom:'10px' }}>
          <div style={{ fontSize:'12px', fontWeight:500, color:'#791F1F', marginBottom:'8px' }}>
            Reason for sending back:
          </div>
          <textarea
            style={{ width:'100%', padding:'8px 10px', fontSize:'13px', border:'0.5px solid #F09595', borderRadius:'6px', fontFamily:'inherit', boxSizing:'border-box', height:'72px', resize:'none', background:'#fff' }}
            placeholder="Explain what needs to be fixed or improved..."
            value={rejectReason}
            onChange={e => setRejectReason(e.target.value)}
            autoFocus
          />
          <div style={{ display:'flex', gap:'8px', marginTop:'8px' }}>
            <button onClick={handleRejectSubmit} disabled={!rejectReason.trim()} style={{ padding:'6px 14px', fontSize:'12px', fontWeight:500, background:'#791F1F', color:'#fff', border:'none', borderRadius:'6px', cursor:'pointer', opacity:!rejectReason.trim()?0.5:1 }}>
              Send back
            </button>
            <button onClick={() => setShowRejectForm(false)} style={{ padding:'6px 14px', fontSize:'12px', background:'none', border:'0.5px solid rgba(0,0,0,0.15)', borderRadius:'6px', cursor:'pointer' }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Action buttons */}
      {!showRejectForm && (
        <div style={{ display:'flex', gap:'6px', flexWrap:'wrap' }}>
          {canStart && (
            <button onClick={() => onAction(task.id, 'start', '')} style={btnStyle('#E6F1FB','#0C447C')}>Start task</button>
          )}
          {canSubmit && (
            <button onClick={() => onAction(task.id, 'submit', '')} style={btnStyle('#EAF3DE','#27500A')}>Mark as done</button>
          )}
          {canL1Approve && (
            <button onClick={() => onAction(task.id, 'l1approve', '')} style={btnStyle('#EAF3DE','#27500A')}>L1 Approve</button>
          )}
          {canL1Sendback && !showRejectForm && (
            <button onClick={() => handleSendback('l1_sendback')} style={btnStyle('#FCEBEB','#791F1F')}>Send back</button>
          )}
          {canL2Approve && (
            <button onClick={() => onAction(task.id, 'l2approve', '')} style={btnStyle('#EAF3DE','#27500A')}>Final Approve ✓</button>
          )}
          {canL2Sendback && !showRejectForm && (
            <button onClick={() => handleSendback('l2_sendback')} style={btnStyle('#FCEBEB','#791F1F')}>Send back</button>
          )}
        </div>
      )}
    </div>
  )
}

const btnStyle = (bg, color) => ({
  padding:'5px 14px', fontSize:'12px', fontWeight:500,
  background:bg, color, border:'none', borderRadius:'6px',
  cursor:'pointer', fontFamily:'inherit',
})

export default TaskCard
