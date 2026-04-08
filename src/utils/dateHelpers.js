import { format, differenceInDays, isPast, parseISO } from 'date-fns'

export const formatDate = (date) => {
  if (!date) return '—'
  try { return format(typeof date === 'string' ? parseISO(date) : date, 'dd MMM yyyy') }
  catch { return date }
}

export const isOverdue = (deadline, status) => {
  if (!deadline || status === 'done') return false
  try {
    const d = typeof deadline === 'string' ? parseISO(deadline) : deadline
    return isPast(d)
  } catch { return false }
}

export const daysOverdue = (deadline) => {
  if (!deadline) return 0
  try {
    const d = typeof deadline === 'string' ? parseISO(deadline) : deadline
    return Math.max(0, differenceInDays(new Date(), d))
  } catch { return 0 }
}

export const daysLeft = (deadline) => {
  if (!deadline) return null
  try {
    const d = typeof deadline === 'string' ? parseISO(deadline) : deadline
    return differenceInDays(d, new Date())
  } catch { return null }
}
