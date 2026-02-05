import { useState, useEffect, useRef } from 'react'
import { Bell, Check, CheckCheck, Clock, AlertTriangle, CheckCircle2, X } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { formatRelative } from '@/lib/helpers'

const typeIcons = {
  task_due_soon: Clock,
  task_completed: CheckCircle2,
  system_alert: AlertTriangle,
}

const typeColors = {
  task_due_soon: 'text-amber-500',
  task_completed: 'text-green-500',
  system_alert: 'text-red-500',
}

// Sample notifications for initial display
const SAMPLE_NOTIFICATIONS = [
  {
    id: 'sample-1',
    type: 'task_due_soon',
    title: 'Task Due Soon',
    message: 'Submit Q4 compliance report — due tomorrow',
    read: false,
    created_at: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'sample-2',
    type: 'task_completed',
    title: 'Task Completed',
    message: 'Marie Johnson completed "Update patient files"',
    read: false,
    created_at: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: 'sample-3',
    type: 'system_alert',
    title: 'System Alert',
    message: 'Brittco sync pending — admin access required',
    read: true,
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
]

export default function NotificationBell() {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState(SAMPLE_NOTIFICATIONS)
  const dropdownRef = useRef(null)

  useEffect(() => {
    fetchNotifications()
  }, [user])

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  async function fetchNotifications() {
    if (!user) return
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20)

    if (!error && data && data.length > 0) {
      setNotifications(data)
    }
    // If error or empty, keep sample data
  }

  async function markAsRead(notification) {
    if (notification.read) return
    // Update local state immediately
    setNotifications(prev =>
      prev.map(n => n.id === notification.id ? { ...n, read: true } : n)
    )
    // If not a sample, update in Supabase
    if (!notification.id.startsWith('sample-')) {
      await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notification.id)
    }
  }

  async function markAllAsRead() {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    if (user) {
      await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false)
    }
  }

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="p-2 rounded-lg hover:bg-surface-hover transition-colors relative"
      >
        <Bell className="w-5 h-5 text-text-secondary" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-danger rounded-full flex items-center justify-center text-[10px] font-bold text-white px-1">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl border border-border shadow-lg overflow-hidden z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <h3 className="text-sm font-semibold text-text">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-primary hover:text-primary-dark font-medium flex items-center gap-1"
              >
                <CheckCheck className="w-3.5 h-3.5" /> Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-border">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-sm text-text-muted">
                No notifications
              </div>
            ) : (
              notifications.map(notification => {
                const TypeIcon = typeIcons[notification.type] || Bell
                const iconColor = typeColors[notification.type] || 'text-text-muted'
                return (
                  <button
                    key={notification.id}
                    onClick={() => markAsRead(notification)}
                    className={`w-full text-left px-4 py-3 hover:bg-surface-hover transition-colors flex gap-3 ${
                      !notification.read ? 'bg-blue-50/50' : ''
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg ${!notification.read ? 'bg-white' : 'bg-surface-alt'} flex items-center justify-center flex-shrink-0`}>
                      <TypeIcon className={`w-4 h-4 ${iconColor}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-medium ${!notification.read ? 'text-text' : 'text-text-secondary'}`}>
                        {notification.title}
                      </p>
                      <p className="text-xs text-text-muted mt-0.5 line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-[10px] text-text-muted mt-1">
                        {formatRelative(notification.created_at)}
                      </p>
                    </div>
                    {!notification.read && (
                      <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-1.5" />
                    )}
                  </button>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}
