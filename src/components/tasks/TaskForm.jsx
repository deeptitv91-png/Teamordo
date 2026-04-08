import { useState } from 'react'

const TaskForm = ({ members = [], currentUser, onSubmit, onCancel }) => {
  const [form, setForm] = useState({ title:'', assignedTo:'', deadline:'' })

  const canAssignToSelf = true
  const eligible = members // Manager and Lead can assign to anyone including themselves

  const handleSubmit = () => {
    if (!form.title.trim()) return
    if (!form.assignedTo) return
    if (!form.deadline) return
    onSubmit({ ...form, assignedBy: currentUser?.userId, deptId: currentUser?.deptId, companyId: currentUser?.companyId })
    setForm({ title:'', assignedTo:'', deadline:'' })
  }

  return (
    <div style={{ background:'#fff', border:'0.5px solid rgba(0,0,0,0.08)', borderRadius:'12px', padding:'16px', marginBottom:'16px' }}>
      <div style={{ fontSize:'13px', fontWeight:500, marginBottom:'12px' }}>New task</div>
      <div style={{ marginBottom:'10px' }}>
        <label style={lbl}>Task title</label>
        <input style={inp} placeholder="Describe the task..." value={form.title} onChange={e => setForm(p=>({...p,title:e.target.value}))} />
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', marginBottom:'12px' }}>
        <div>
          <label style={lbl}>Assign to</label>
          <select style={inp} value={form.assignedTo} onChange={e => setForm(p=>({...p,assignedTo:e.target.value}))}>
            <option value="">Select member...</option>
            {eligible.map(m => (
              <option key={m.userId} value={m.userId}>
                {m.name} — {m.designation} ({m.category})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label style={lbl}>Deadline</label>
          <input style={inp} type="date" value={form.deadline} onChange={e => setForm(p=>({...p,deadline:e.target.value}))} />
        </div>
      </div>
      <div style={{ fontSize:'11px', color:'#888', marginBottom:'12px' }}>
        You ({currentUser?.name}) will be the task creator and give the final L2 approval.
      </div>
      <div style={{ display:'flex', gap:'8px' }}>
        <button onClick={handleSubmit} style={{ padding:'7px 16px', fontSize:'12px', fontWeight:500, background:'#378ADD', color:'#fff', border:'none', borderRadius:'8px', cursor:'pointer' }}>
          Create task
        </button>
        <button onClick={onCancel} style={{ padding:'7px 16px', fontSize:'12px', border:'0.5px solid rgba(0,0,0,0.15)', borderRadius:'8px', cursor:'pointer', background:'transparent' }}>
          Cancel
        </button>
      </div>
    </div>
  )
}

const lbl = { fontSize:'11px', fontWeight:500, color:'#666', display:'block', marginBottom:'3px', textTransform:'uppercase', letterSpacing:'0.04em' }
const inp = { width:'100%', padding:'8px 10px', fontSize:'13px', border:'0.5px solid rgba(0,0,0,0.2)', borderRadius:'8px', fontFamily:'inherit', boxSizing:'border-box' }

export default TaskForm
