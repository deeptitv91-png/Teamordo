import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { getTasksByDept, getMembersByDept } from '../../firebase/firestore'
import { getStatusMeta } from '../../utils/roleDetector'
import { formatDate, isOverdue } from '../../utils/dateHelpers'
import Badge from '../../components/common/Badge'
import Avatar from '../../components/common/Avatar'
import { getCategoryColor } from '../../utils/roleDetector'

const AllTasks = () => {
  const { user } = useAuth()
  const [tasks, setTasks]     = useState([])
  const [members, setMembers] = useState([])
  const [filter, setFilter]   = useState('all')

  useEffect(() => {
    if (!user) return
    getTasksByDept(user.companyId, user.deptId).then(setTasks)
    getMembersByDept(user.companyId, user.deptId).then(setMembers)
  }, [user])

  const filtered = filter === 'all' ? tasks : tasks.filter(t => t.status === filter)
  const getMember = (id) => members.find(m => m.userId === id)

  return (
    <div>
      <div style={{ fontSize:'16px', fontWeight:500, marginBottom:'4px' }}>All tasks</div>
      <div style={{ fontSize:'12px', color:'#888', marginBottom:'16px' }}>Read-only view. Login with your own ID to take actions.</div>

      <div style={{ display:'flex', gap:'6px', marginBottom:'16px', flexWrap:'wrap' }}>
        {['all','todo','inprogress','l1_pending','l2_pending','done'].map(s => {
          const meta = s === 'all' ? { label:'All', color:'#F1EFE8', text:'#444441' } : getStatusMeta(s)
          return (
            <button key={s} onClick={() => setFilter(s)} style={{
              padding:'4px 12px', fontSize:'11px', borderRadius:'20px', cursor:'pointer', fontFamily:'inherit',
              background: filter===s ? meta.color : 'transparent',
              color: filter===s ? meta.text : '#888',
              border: `0.5px solid ${filter===s ? meta.color : 'rgba(0,0,0,0.15)'}`,
              fontWeight: filter===s ? 500 : 400,
            }}>
              {meta.label}
            </button>
          )
        })}
      </div>

      {filtered.length === 0 ? (
        <div style={{ fontSize:'12px', color:'#aaa', padding:'20px 0' }}>No tasks found.</div>
      ) : filtered.map(t => {
        const status   = getStatusMeta(t.status)
        const assignee = getMember(t.assignedTo)
        const creator  = getMember(t.assignedBy)
        const overdue  = isOverdue(t.deadline, t.status)
        const ac       = assignee ? getCategoryColor(assignee.category) : { bg:'#E6F1FB', tx:'#0C447C' }
        const initials = (name) => name?.split(' ').map(w=>w[0]).join('').substring(0,2).toUpperCase() || '??'

        return (
          <div key={t.id} style={{
            background:'#fff', borderRadius:'10px', padding:'12px 14px', marginBottom:'8px',
            border:`0.5px solid ${overdue && t.status!=='done' ? '#E24B4A' : 'rgba(0,0,0,0.08)'}`,
            borderLeftWidth: overdue && t.status!=='done' ? '3px' : '0.5px',
            opacity: t.status === 'done' ? 0.7 : 1,
          }}>
            <div style={{ fontSize:'13px', fontWeight:500, marginBottom:'6px', textDecoration: t.status==='done'?'line-through':'' }}>{t.title}</div>
            <div style={{ display:'flex', alignItems:'center', gap:'8px', flexWrap:'wrap' }}>
              <Badge label={status.label} color={status.color} textColor={status.text} />
              {overdue && t.status!=='done' && <Badge label="Overdue" color="#FCEBEB" textColor="#791F1F" />}
              {assignee && (
                <div style={{ display:'flex', alignItems:'center', gap:'4px' }}>
                  <Avatar initials={initials(assignee.name)} bg={ac.bg} tx={ac.tx} size={18} />
                  <span style={{ fontSize:'11px', color:'#888' }}>{assignee.name}</span>
                </div>
              )}
              {creator && <span style={{ fontSize:'11px', color:'#aaa' }}>by {creator.name}</span>}
              <span style={{ fontSize:'11px', color:'#888', marginLeft:'auto' }}>{formatDate(t.deadline)}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default AllTasks
