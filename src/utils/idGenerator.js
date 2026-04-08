export const generateCompanyId = (companyName) => {
  const prefix = companyName.replace(/\s+/g, '').substring(0, 4).toUpperCase()
  const suffix = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `CORP-${prefix}-${suffix}`
}

export const generateDeptId = (deptName, index) => {
  const prefix = deptName.replace(/\s+/g, '').substring(0, 3).toUpperCase()
  const num = String(index).padStart(3, '0')
  return `DEPT-${prefix}-${num}`
}

export const generateMemberId = (companyId, counter) => {
  const co = companyId.split('-')[1] || 'XX'
  const num = String(counter).padStart(4, '0')
  return `MEM-${co}-${num}`
}

export const generatePassword = (name) => {
  const base = name.split(' ')[0].toLowerCase()
  const num = Math.floor(1000 + Math.random() * 9000)
  return `${base}@${num}`
}

export const detectRoleFromId = (userId) => {
  if (!userId) return null
  if (userId.startsWith('CORP-')) return 'admin'
  if (userId.startsWith('DEPT-')) return 'dept_head'
  if (userId.startsWith('MEM-'))  return 'member'
  return null
}
