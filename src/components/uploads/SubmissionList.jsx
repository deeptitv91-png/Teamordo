import { getStatusMeta } from '../../utils/roleDetector'
import { formatDate } from '../../utils/dateHelpers'
import Badge from '../common/Badge'
import Avatar from '../common/Avatar'
import { getCategoryColor } from '../../utils/roleDetector'

const FILE_ICON = { Image:'◼', Video:'▶', PDF:'▪', Word:'▪' }

const SubmissionList = ({ uploads, members, currentUser, onAction, readOnly }) => {
  if (uploads.length === 0) {
    return <div style={{ fontSize:'12px', color:'#aaa', padding:'20px 0', textAlign:'center' }}>No submissions yet.</div>
  }

  const getMember = (id) => members.find(m => m.userId === id)

  return uploads.map(u => {
    const status    = getStatusMeta(u.status)
    const submitter = getMember(u.submittedBy)
    const reviewer  = u.reviewedBy ? getMember(u.reviewedBy) : null
    const sc        = submitter ? getCategoryColor(submitter.category) : { bg:'#E6F1FB', tx:'#0C447C' }
    const initials  = (name) => name?.split(' ').map(w=>w[0]).join('').substring(0,2).toUpperCase() || '??'

    const isSubmitter   = currentUser?.userId === u.submittedBy
    const isReviewer    = ['manager','lead'].includes(currentUser?.category) || currentUser?.role === 'dept_head'
    const canReview     = isReviewer && !isSubmitter && u.status === 'review'
    const canResubmit   = isSubmitter && (u.status === 'correction' || u.status === 'rework')

    return (
      <div key={u.id} style={{
        background: '#fff',
        border: `0.5px solid ${u.status === 'rework' ? '#E24B4A' : u.status === 'correction' ? '#EF9F27' : u.status === 'approved' ? '#97C459' : 'rgba(0,0,0,0.08)'}`,
        borderLeftWidth: u.status !== 'review' ? '3px' : '0.5px',
        borderRadius: '10px',
        padding: '12px 14px',
        marginBottom: '8px',
      }}>
        <div style={{ display:'flex', alignItems:'flex-start', gap:'8px', marginBottom:'6px' }}>
          {submitter && <Avatar initials={initials(submitter.name)} bg={sc.bg} tx={sc.tx} size={24} />}
          <div style={{ flex:1 }}>
            <div style={{ fontSize:'13px', fontWeight:500 }}>
              {FILE_ICON[u.fileType] || '▪'} {u.fileName}
            </div>
            <div style={{ fontSize:'11px', color:'#888', marginTop:'1px' }}>
              {u.taskTitle} · {submitter?.name} · {formatDate(u.createdAt?.toDate?.() || u.createdAt)}
            </div>
          </div>
          <Badge label={status.label} color={status.color} textColor={status.text} />
        </div>

        {u.reviewNote && (
          <div style={{
            fontSize: '12px',
            background: u.status === 'rework' ? '#FEF2F2' : '#FFFBEB',
            padding: '8px 10px',
            borderRadius: '6px',
            color: u.status === 'rework' ? '#791F1F' : '#633806',
            marginBottom: '8px',
          }}>
            {reviewer && <span style={{ fontWeight:500 }}>{reviewer.name}: </span>}
            {u.reviewNote}
          </div>
        )}

        {u.fileUrl && (
          <a
            href={u.fileUrl}
            target="_blank"
            rel="noreferrer"
            style={{ fontSize:'11px', color:'#378ADD', display:'inline-block', marginBottom:'8px' }}
          >
            View file
          </a>
        )}

        {!readOnly && (
          <div style={{ display:'flex', gap:'6px', flexWrap:'wrap' }}>
            {canReview && (
              <>
                <button onClick={() => onAction(u.id, 'approved', '')} style={btn('#EAF3DE','#27500A')}>Approve</button>
                <button onClick={() => onAction(u.id, 'correction', 'Please make the required corrections and resubmit.')} style={btn('#FAEEDA','#633806')}>Correction</button>
                <button onClick={() => onAction(u.id, 'rework', 'This needs to be redone from scratch. Please rework and resubmit.')} style={btn('#FCEBEB','#791F1F')}>Rework</button>
              </>
            )}
            {canResubmit && (
              <button onClick={() => onAction(u.id, 'review', '')} style={btn('#E6F1FB','#0C447C')}>Resubmit</button>
            )}
          </div>
        )}
      </div>
    )
  })
}

const btn = (bg, color) => ({
  padding: '4px 12px', fontSize: '11px', borderRadius: '6px',
  background: bg, color, border: 'none', cursor: 'pointer', fontFamily: 'inherit',
})

export default SubmissionList
