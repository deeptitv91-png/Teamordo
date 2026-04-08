import { getStatusMeta, getCategoryColor } from '../../utils/roleDetector'
import { formatDate, isOverdue, daysOverdue } from '../../utils/dateHelpers'
import Badge from '../common/Badge'
import Avatar from '../common/Avatar'

const TaskCard = ({ task, currentUser, members = [], onAction }) => {
  const status    = getStatusMeta(task.status)
  const overdue   = isOverdue(task.deadline, task.status)
  const daysOver  = overdue ? daysOverdue(task.deadline) : 0
  const assignee  = members.find(m => m.userId === task.assignedTo)
  const creator   = members.find(m => m.userId === task.assignedBy)

  const isAssignee   = currentUser?.userId === task.assignedTo
  const isCreator    = currentUser?.userId === task.assignedBy
  const isManagerLvl = ['manager','lead'].includes(currentUser?.category) || currentUser?.role === 'dept_head' || currentUser?.role === 'admin'

  // What actions can this user perform?
  const actions = []
  if (isAssignee && task.status === 'todo')        actions.push({ key:'start',     label:'Start task',         color:'#E6F1FB', tx:'#0C447C' })
  if (isAssignee && task.status === 'inprogress')  actions.push({ key:'submit',    label:'Mark as done',       color:'#FAEEDA', tx:'#633806' })
  if (isManagerLvl && task.status === 'l1_pending' && !isAssignee) {
    actions.push({ key:'l1approve', label:'L1 Approve',  color:'#EAF3DE', tx:'#27500A' })
    actions.push({ key:'sendback',  label:'Send back',   color:'#FCEBEB', tx:'#791F1F' })
  }
  if (isCreator && task.status === 'l2_pending') {
    actions.push({ key:'l2approve', label:'Final approve', color:'#EEEDFE', tx:'#3C3489' })
    actions.push({ key:'rework',    label:'Rework',        color:'#FCEBEB', tx:'#791F1F' })
  }

  const initials = (name) => name ? name.split(' ').map(w=>w[0]).join('').substring(0,2).toUpperCase() : '??'
  const ac = assignee ? getCategoryColor(assignee.category) : { bg:'#E6F1FB', tx:'#0C447C' }

  return (
    <div style={{
      background: '#fff',
      border: `0.5px solid ${overdue && task.status !== 'done' ? '#E24B4A' : task.status === 'l1_pending' ? '#EF9F27' : task.status === 'l2_pending' ? '#7F77DD' : 'rgba(0,0,0,0.08)'}`,
      borderLeftWidth: overdue || task.status === 'l1_pending' || task.status === 'l2_pending' ? '3px' : '0.5px',
      borderRadius: '10px', padding: '12px 14px', marginBottom: '8px',
    }}>
      <div style={{ fontSize:'13px', fontWeight:500, marginBottom:'6px', lineHeight:1.35, textDecoration: task.status==='done'?'line-through':'none', color: task.status==='done'?'#aaa':'inherit' }}>
        {task.title}
      </div>

      <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'6px', flexWrap:'wrap' }}>
        <Badge label={status.label} color={status.color} textColor={status.text} />
        {overdue && task.status !== 'done' && (
          <Badge label={`${daysOver}d overdue`} color="#FCEBEB" textColor="#791F1F" />
        )}
        <span style={{ fontSize:'11px', color:'#888', marginLeft:'auto' }}>Due: {formatDate(task.deadline)}</span>
      </div>

      <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom: actions.length?'8px':0 }}>
        {assignee && (
          <div style={{ display:'flex', alignItems:'center', gap:'5px' }}>
            <Avatar initials={initials(assignee.name)} bg={ac.bg} tx={ac.tx} size={20} />
            <span style={{ fontSize:'11px', color:'#888' }}>{assignee.name}</span>
          </div>
        )}
        {creator && (
          <span style={{ fontSize:'11px', color:'#aaa', marginLeft:'auto' }}>by {creator.name}</span>
        )}
      </div>

      {/* Approval trail */}
      {(task.l1By || task.l2By) && (
        <div style={{ marginBottom:'8px' }}>
          {task.l1By && <div style={{ fontSize:'11px', color:'#27500A' }}>L1 approved by {members.find(m=>m.userId===task.l1By)?.name || task.l1By}</div>}
          {task.l2By && <div style={{ fontSize:'11px', color:'#3C3489' }}>Final approved by {members.find(m=>m.userId===task.l2By)?.name || task.l2By}</div>}
        </div>
      )}

      {actions.length > 0 && (
        <div style={{ display:'flex', gap:'6px', flexWrap:'wrap' }}>
          {actions.map(a => (
            <button key={a.key} onClick={() => onAction(task.id, a.key)} style={{
              padding:'4px 12px', fontSize:'11px', borderRadius:'6px',
              background: a.color, color: a.tx, border:'none', cursor:'pointer', fontFamily:'inherit',
            }}>
              {a.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default TaskCard
