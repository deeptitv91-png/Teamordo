export const CATEGORIES = ['manager', 'lead', 'executive', 'trainee']

export const canAddMembers = (category) => category === 'manager'

export const canGiveL1Approval = (category) =>
  ['manager', 'lead'].includes(category)

// Dept head is always manager-level
export const isLead = (role, category) =>
  role === 'admin' || role === 'dept_head' || canGiveL1Approval(category)

export const getCategoryColor = (category) => {
  const map = {
    manager:   { bg: '#EEEDFE', tx: '#3C3489', label: 'Manager' },
    lead:      { bg: '#E6F1FB', tx: '#0C447C', label: 'Lead' },
    executive: { bg: '#EAF3DE', tx: '#27500A', label: 'Executive' },
    trainee:   { bg: '#F1EFE8', tx: '#444441', label: 'Trainee' },
  }
  return map[category] || map.trainee
}

export const getStatusMeta = (status) => {
  const map = {
    todo:        { label: 'To do',              color: '#F1EFE8', text: '#444441' },
    inprogress:  { label: 'In progress',        color: '#E6F1FB', text: '#0C447C' },
    l1_pending:  { label: 'Awaiting L1',        color: '#FAEEDA', text: '#633806' },
    l2_pending:  { label: 'Awaiting L2',        color: '#EEEDFE', text: '#3C3489' },
    done:        { label: 'Done',               color: '#EAF3DE', text: '#27500A' },
    correction:  { label: 'Correction needed',  color: '#FAEEDA', text: '#633806' },
    rework:      { label: 'Rework needed',      color: '#FCEBEB', text: '#791F1F' },
    approved:    { label: 'Approved',           color: '#EAF3DE', text: '#27500A' },
    review:      { label: 'In review',          color: '#E6F1FB', text: '#0C447C' },
  }
  return map[status] || map.todo
}

export const detectRoleFromId = (userId) => {
  if (!userId) return null
  if (userId.startsWith('CORP-')) return 'admin'
  if (userId.startsWith('DEPT-')) return 'dept_head'
  if (userId.startsWith('MEM-'))  return 'member'
  return null
}
