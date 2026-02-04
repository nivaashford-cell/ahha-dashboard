import { format, formatDistanceToNow, isToday, isTomorrow, isPast, parseISO } from 'date-fns'

export function formatDate(date) {
  if (!date) return '—'
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'MMM d, yyyy')
}

export function formatDateTime(date) {
  if (!date) return '—'
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'MMM d, yyyy h:mm a')
}

export function formatRelative(date) {
  if (!date) return '—'
  const d = typeof date === 'string' ? parseISO(date) : date
  return formatDistanceToNow(d, { addSuffix: true })
}

export function getDueDateLabel(date) {
  if (!date) return null
  const d = typeof date === 'string' ? parseISO(date) : date
  if (isToday(d)) return 'Today'
  if (isTomorrow(d)) return 'Tomorrow'
  if (isPast(d)) return 'Overdue'
  return format(d, 'MMM d')
}

export function getDueDateColor(date) {
  if (!date) return ''
  const d = typeof date === 'string' ? parseISO(date) : date
  if (isPast(d) && !isToday(d)) return 'text-danger'
  if (isToday(d)) return 'text-warning'
  if (isTomorrow(d)) return 'text-accent'
  return 'text-text-secondary'
}

export const statusColors = {
  todo: 'badge-neutral',
  'in-progress': 'badge-info',
  done: 'badge-success',
}

export const priorityColors = {
  low: 'badge-neutral',
  medium: 'badge-info',
  high: 'badge-warning',
  urgent: 'badge-danger',
}

export const automationStatusColors = {
  success: 'badge-success',
  failed: 'badge-danger',
  pending: 'badge-warning',
}

export function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export function truncate(str, len = 50) {
  if (!str) return ''
  return str.length > len ? str.substring(0, len) + '...' : str
}

export function getInitials(name) {
  if (!name) return '?'
  return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
}
