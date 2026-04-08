import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useCompany } from '../../context/CompanyContext'
import { getTasksByDept, getMembersByDept } from '../../firebase/firestore'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '../../firebase/config'
import { isOverdue, daysOverdue, formatDate } from '../../utils/dateHelpers'
import { getStatusMeta } from '../../utils/roleDetector'
import { exportReportPDF } from '../../utils/pdfExport'
import Notify from '../../components/common/Notify'
import { subDays, startOfWeek, startOfMonth, startOfYear, isAfter, parseISO } from 'date-fns'

const PERIODS = [
  { key:'daily',   label:'Today' },
  { key:'weekly',  label:'This week' },
  { key:'monthly', label:'This month' },
  { key:'yearly',  label:'This year' },
  { key:'custom',  label:'Custom range' },
]

const getStartDate = (period, customFrom) => {
  const now = new Date()
  if (period === 'daily')   return subDays(now, 1)
  if (period === 'weekly')  return startOfWeek(now)
  if (period === 'monthly') return startOfMonth(now)
  if (period === 'yearly')  return startOfYear(now)
  if (period === 'custom')  return customFrom ? new Date(customFrom) : subDays(now, 30)
  return subDays(now, 30)
}

const ReportsPage = () => {
  const { user }    = useAuth()
  const { company } = useCompany()
  const [period,   setPeriod]   = useState('monthly')
  const [from,     setFrom]     = useState('')
  const [to,       setTo]       = useState('')
  const [tasks,    setTasks]    = useState([])
  const [members,  setMembers]  = useState([])
  const [uploads,  setUploads]  = useState([])
  const [notify,   setNotify]   = useState(null)
  const [generated,setGenerated]= useState(false)

  const loadData = async () => {
    const t = await getTasksByDept(user.companyId, user.deptId || '')
    const m = await getMembersByDept(user.companyId, user.deptId || '')
    setTasks(t)
    setMembers(m)

    const q = query(
      collection(db, 'companies', user.companyId, 'uploads'),
      where('deptId', '==', user.deptId || '')
    )
    const snap = await getDocs(q)
    setUploads(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    setGenerated(true)
  }

  // Filter tasks within period
  const filteredTasks = tasks.filter(t => {
    const start = getStartDate(period, from)
    const end   = to ? new Date(to) : new Date()
    const created = t.createdAt?.toDate?.() || new Date(t.createdAt || 0)
    return created >= start && created <= end
  })

  // Per-member stats
  const personStats = members.map(m => {
    const myTasks    = filteredTasks.filter(t => t.assignedTo === m.userId)
    const completed  = myTasks.filter(t => t.status === 'done').length
    const delayed    = myTasks.filter(t => isOverdue(t.deadline, t.status)).length
    const myUploads  = uploads.filter(u => u.submittedBy === m.userId)
    const uploadStat = {
      approved:   myUploads.filter(u => u.status === 'approved').length,
      review:     myUploads.filter(u => u.status === 'review').length,
      correction: myUploads.filter(u => u.status === 'correction').length,
      rework:     myUploads.filter(u => u.status === 'rework').length,
    }
    // Score: completion rate 50% + no delays 30% + uploads approved 20%
    const compRate    = myTasks.length ? (completed / myTasks.length) : 1
    const delayRate   = myTasks.length ? (1 - delayed / myTasks.length) : 1
    const uploadRate  = myUploads.length ? (uploadStat.approved / myUploads.length) : 1
    const score       = Math.round((compRate * 50) + (delayRate * 30) + (uploadRate * 20))

    return {
      ...m,
      completed, total: myTasks.length, delayed,
      avgApproval: '1.8d',
      uploadStatus: uploadStat,
      score,
    }
  }).filter(p => p.total > 0 || uploads.some(u => u.submittedBy === p.userId))

  const delayedTasks = filteredTasks
    .filter(t => isOverdue(t.deadline, t.status))
    .map(t => ({
      ...t,
      assigneeName: members.find(m => m.userId === t.assignedTo)?.name || t.assignedTo
    }))

  const summaryMetrics = [
    { label:'Tasks completed', value: filteredTasks.filter(t=>t.status==='done').length },
    { label:'Total tasks',     value: filteredTasks.length },
    { label:'Delayed',         value: delayedTasks.length },
    { label:'Uploads reviewed',value: uploads.filter(u=>u.status!=='review').length },
  ]

  const periodLabel = () => {
    if (period === 'custom' && from && to) return `${from} to ${to}`
    return PERIODS.find(p=>p.key===period)?.label || period
  }

  const handleDownloadPDF = () => {
    exportReportPDF({
      period:       periodLabel(),
      company,
      metrics:      summaryMetrics,
      persons:      personStats,
      delayedTasks,
      generatedBy:  user?.name,
    })
    setNotify({ msg:'PDF downloaded successfully.', type:'ok' })
  }

  const scoreColor = (s) => s >= 80 ? '#27500A' : s >= 60 ? '#633806' : '#791F1F'
  const scoreBg    = (s) => s >= 80 ? '#EAF3DE' : s >= 60 ? '#FAEEDA' : '#FCEBEB'

  return (
    <div>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'20px', flexWrap:'wrap', gap:'10px' }}>
        <div style={{ fontSize:'16px', fontWeight:500 }}>Reports</div>
        {generated && (
          <button onClick={handleDownloadPDF} style={{ padding:'8px 16px', fontSize:'12px', fontWeight:500, background:'#27500A', color:'#EAF3DE', border:'none', borderRadius:'8px', cursor:'pointer' }}>
            Download PDF
          </button>
        )}
      </div>

      {notify && <Notify message={notify.msg} type={notify.type} onDone={() => setNotify(null)} />}

      {/* Period selector */}
      <div style={{ display:'flex', gap:'6px', flexWrap:'wrap', marginBottom:'16px', alignItems:'center' }}>
        {PERIODS.map(p => (
          <button key={p.key} onClick={() => { setPeriod(p.key); setGenerated(false) }} style={{
            padding:'5px 14px', fontSize:'12px', borderRadius:'20px', cursor:'pointer', fontFamily:'inherit',
            background: period===p.key ? '#E6F1FB' : 'transparent',
            color: period===p.key ? '#0C447C' : '#888',
            border: `0.5px solid ${period===p.key ? '#85B7EB' : 'rgba(0,0,0,0.15)'}`,
            fontWeight: period===p.key ? 500 : 400,
          }}>
            {p.label}
          </button>
        ))}
      </div>

      {period === 'custom' && (
        <div style={{ display:'flex', gap:'10px', alignItems:'center', marginBottom:'16px', flexWrap:'wrap' }}>
          <div>
            <label style={lbl}>From</label>
            <input type="date" style={inp} value={from} onChange={e => setFrom(e.target.value)} />
          </div>
          <div>
            <label style={lbl}>To</label>
            <input type="date" style={inp} value={to} onChange={e => setTo(e.target.value)} />
          </div>
        </div>
      )}

      <button onClick={loadData} style={{ padding:'8px 20px', fontSize:'13px', fontWeight:500, background:'#378ADD', color:'#fff', border:'none', borderRadius:'8px', cursor:'pointer', marginBottom:'20px' }}>
        Generate report
      </button>

      {generated && (
        <>
          <div style={{ fontSize:'13px', color:'#888', marginBottom:'16px' }}>
            Report: <strong style={{ color:'#1a1a1a' }}>{periodLabel()}</strong>
          </div>

          {/* Summary metrics */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(120px,1fr))', gap:'10px', marginBottom:'20px' }}>
            {summaryMetrics.map(m => (
              <div key={m.label} style={{ background:'#fff', border:'0.5px solid rgba(0,0,0,0.08)', borderRadius:'10px', padding:'14px' }}>
                <div style={{ fontSize:'11px', color:'#888', marginBottom:'4px' }}>{m.label}</div>
                <div style={{ fontSize:'22px', fontWeight:500 }}>{m.value}</div>
              </div>
            ))}
          </div>

          {/* Per-person performance */}
          <div style={{ fontSize:'11px', fontWeight:500, color:'#888', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'10px' }}>
            Team performance
          </div>
          <div style={{ background:'#fff', border:'0.5px solid rgba(0,0,0,0.08)', borderRadius:'12px', overflow:'hidden', marginBottom:'16px' }}>
            {personStats.length === 0 ? (
              <div style={{ padding:'20px', fontSize:'12px', color:'#aaa', textAlign:'center' }}>No data for this period.</div>
            ) : personStats.map((p, i) => (
              <div key={p.userId} style={{
                display:'flex', alignItems:'center', gap:'12px', padding:'12px 16px',
                borderBottom: i < personStats.length-1 ? '0.5px solid rgba(0,0,0,0.06)' : 'none',
                flexWrap:'wrap',
              }}>
                <div style={{ width:'28px', height:'28px', borderRadius:'50%', background: p.bg || '#E6F1FB', color: p.tx || '#0C447C', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'10px', fontWeight:500 }}>
                  {p.name.split(' ').map(w=>w[0]).join('').substring(0,2).toUpperCase()}
                </div>
                <div style={{ flex:1, minWidth:'120px' }}>
                  <div style={{ fontSize:'13px', fontWeight:500 }}>{p.name}</div>
                  <div style={{ fontSize:'11px', color:'#888' }}>{p.designation || p.role}</div>
                </div>
                <div style={{ textAlign:'right', minWidth:'70px' }}>
                  <div style={{ fontSize:'13px', fontWeight:500 }}>{p.completed}/{p.total}</div>
                  <div style={{ fontSize:'10px', color:'#888' }}>tasks done</div>
                </div>
                <div style={{ textAlign:'right', minWidth:'55px' }}>
                  <div style={{ fontSize:'13px', fontWeight:500, color: p.delayed > 0 ? '#791F1F' : '#27500A' }}>{p.delayed}</div>
                  <div style={{ fontSize:'10px', color:'#888' }}>delayed</div>
                </div>
                <div style={{ minWidth:'120px' }}>
                  <div style={{ fontSize:'10px', color:'#888', marginBottom:'3px' }}>Uploads</div>
                  <div style={{ display:'flex', gap:'4px', flexWrap:'wrap' }}>
                    {p.uploadStatus.approved > 0   && <span style={{ fontSize:'10px', padding:'1px 6px', borderRadius:'20px', background:'#EAF3DE', color:'#27500A' }}>{p.uploadStatus.approved}✓</span>}
                    {p.uploadStatus.review > 0      && <span style={{ fontSize:'10px', padding:'1px 6px', borderRadius:'20px', background:'#E6F1FB', color:'#0C447C' }}>{p.uploadStatus.review} review</span>}
                    {p.uploadStatus.correction > 0  && <span style={{ fontSize:'10px', padding:'1px 6px', borderRadius:'20px', background:'#FAEEDA', color:'#633806' }}>{p.uploadStatus.correction} corr.</span>}
                    {p.uploadStatus.rework > 0      && <span style={{ fontSize:'10px', padding:'1px 6px', borderRadius:'20px', background:'#FCEBEB', color:'#791F1F' }}>{p.uploadStatus.rework} rework</span>}
                    {Object.values(p.uploadStatus).every(v=>v===0) && <span style={{ fontSize:'10px', color:'#aaa' }}>—</span>}
                  </div>
                </div>
                <div style={{ minWidth:'80px' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'6px' }}>
                    <div style={{ flex:1, height:'6px', background:'#eee', borderRadius:'3px' }}>
                      <div style={{ width:`${p.score}%`, height:'6px', background: scoreColor(p.score), borderRadius:'3px' }} />
                    </div>
                    <span style={{ fontSize:'12px', fontWeight:500, color: scoreColor(p.score), minWidth:'28px' }}>{p.score}</span>
                  </div>
                  <div style={{ fontSize:'10px', color:'#888', textAlign:'right' }}>score</div>
                </div>
              </div>
            ))}
          </div>

          {/* Delayed tasks */}
          {delayedTasks.length > 0 && (
            <>
              <div style={{ fontSize:'11px', fontWeight:500, color:'#888', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'10px' }}>
                Delayed tasks ({delayedTasks.length})
              </div>
              <div style={{ background:'#fff', border:'0.5px solid rgba(0,0,0,0.08)', borderRadius:'12px', overflow:'hidden' }}>
                {delayedTasks.map((t, i) => (
                  <div key={t.id} style={{ display:'flex', alignItems:'center', gap:'10px', padding:'11px 16px', borderBottom: i < delayedTasks.length-1 ? '0.5px solid rgba(0,0,0,0.06)' : 'none', flexWrap:'wrap' }}>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:'13px', fontWeight:500 }}>{t.title}</div>
                      <div style={{ fontSize:'11px', color:'#888', marginTop:'1px' }}>Assignee: {t.assigneeName}</div>
                    </div>
                    <span style={{ fontSize:'10px', padding:'2px 8px', borderRadius:'20px', background:'#FCEBEB', color:'#791F1F', fontWeight:500 }}>
                      {daysOverdue(t.deadline)}d overdue
                    </span>
                    <span style={{ fontSize:'11px', color:'#888' }}>{getStatusMeta(t.status).label}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}

const lbl = { fontSize:'11px', fontWeight:500, color:'#666', display:'block', marginBottom:'3px', textTransform:'uppercase', letterSpacing:'0.04em' }
const inp = { padding:'7px 10px', fontSize:'13px', border:'0.5px solid rgba(0,0,0,0.2)', borderRadius:'8px', fontFamily:'inherit' }

export default ReportsPage
