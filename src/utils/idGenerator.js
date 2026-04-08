export const generateCompanyId = (companyName) => {
  const clean  = companyName.replace(/\s+/g, '-').toUpperCase().replace(/[^A-Z0-9-]/g, '')
  const suffix = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `CORP-${clean}-${suffix}`
}

export const generateDeptId = (deptName, index) => {
  const clean = deptName.replace(/\s+/g, '-').toUpperCase().replace(/[^A-Z0-9-]/g, '')
  const num   = String(index).padStart(3, '0')
  return `DEPT-${clean}-${num}`
}

export const generateMemberId = (companyId, counter) => {
  const co  = companyId.split('-').slice(1, -1).join('-')
  const num = String(counter).padStart(4, '0')
  return `MEM-${co}-${num}`
}

export const generatePassword = (name) => {
  const base = name.split(' ')[0].toLowerCase()
  const num  = Math.floor(1000 + Math.random() * 9000)
  return `${base}@${num}`
}

export const detectRoleFromId = (userId) => {
  if (!userId) return null
  if (userId.startsWith('CORP-')) return 'admin'
  if (userId.startsWith('DEPT-')) return 'dept_head'
  if (userId.startsWith('MEM-'))  return 'member'
  return null
}
