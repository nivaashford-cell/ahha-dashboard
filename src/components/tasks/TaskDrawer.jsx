import { useState, useEffect, useRef } from 'react'
import {
  X, Calendar, User, Flag, Clock, CheckCircle2,
  Brain, Zap, Target, AlertCircle, Sparkles,
  ArrowRight, Loader2, Bot, ChevronRight,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { formatDate, getDueDateLabel, getDueDateColor, priorityColors } from '@/lib/helpers'

const typeConfig = {
  thinking: { icon: Brain, color: 'text-purple-500', bg: 'bg-purple-50', border: 'border-purple-200', label: 'Thinking' },
  progress: { icon: ArrowRight, color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-200', label: 'Progress' },
  milestone: { icon: Target, color: 'text-green-500', bg: 'bg-green-50', border: 'border-green-200', label: 'Milestone' },
  complete: { icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', label: 'Complete' },
  error: { icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-200', label: 'Blocked' },
}

function TimeAgo({ date }) {
  const [, setTick] = useState(0)
  useEffect(() => {
    const i = setInterval(() => setTick(t => t + 1), 10000)
    return () => clearInterval(i)
  }, [])
  const now = new Date()
  const then = new Date(date)
  const diffMs = now - then
  const diffSec = Math.floor(diffMs / 1000)
  if (diffSec < 10) return <span>just now</span>
  if (diffSec < 60) return <span>{diffSec}s ago</span>
  const diffMin = Math.floor(diffSec / 60)
  if (diffMin < 60) return <span>{diffMin}m ago</span>
  const diffHr = Math.floor(diffMin / 60)
  if (diffHr < 24) return <span>{diffHr}h ago</span>
  return <span>{formatDate(date)}</span>
}

function ActivityItem({ activity, isLatest }) {
  const config = typeConfig[activity.type] || typeConfig.thinking
  const Icon = config.icon

  return (
    <div className={`flex gap-3 ${isLatest ? 'animate-fade-in' : ''}`}>
      <div className="flex flex-col items-center">
        <div className={`w-8 h-8 rounded-full ${config.bg} border ${config.border} flex items-center justify-center flex-shrink-0 ${
          isLatest && activity.type === 'thinking' ? 'animate-pulse' : ''
        }`}>
          <Icon className={`w-4 h-4 ${config.color}`} />
        </div>
        <div className="w-px flex-1 bg-border mt-1" />
      </div>
      <div className="pb-5 flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className={`text-[10px] font-semibold uppercase tracking-wide ${config.color}`}>
            {config.label}
          </span>
          <span className="text-[10px] text-text-muted">
            <TimeAgo date={activity.created_at} />
          </span>
        </div>
        <p className="text-sm text-text leading-relaxed">{activity.message}</p>
      </div>
    </div>
  )
}

function ThinkingDots() {
  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <div className="w-8 h-8 rounded-full bg-purple-50 border border-purple-200 flex items-center justify-center flex-shrink-0 animate-pulse">
          <Brain className="w-4 h-4 text-purple-500" />
        </div>
      </div>
      <div className="flex items-center gap-1 pt-2">
        <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '150ms' }} />
        <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  )
}

export default function TaskDrawer({ task, isOpen, onClose }) {
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [usingSample, setUsingSample] = useState(false)
  const scrollRef = useRef(null)
  const isWorking = task?.status === 'in-progress' && task?.assigned_to?.toLowerCase() === 'niva'

  // Fetch existing activity
  useEffect(() => {
    if (!task || !isOpen) return

    async function fetchActivity() {
      setLoading(true)
      const { data, error } = await supabase
        .from('task_activity')
        .select('*')
        .eq('task_id', task.id)
        .order('created_at', { ascending: true })

      if (error) {
        // Table might not exist yet - use sample data
        setUsingSample(true)
        setActivities(getSampleActivity(task))
      } else {
        setUsingSample(false)
        setActivities(data || [])
      }
      setLoading(false)
    }

    fetchActivity()
  }, [task?.id, isOpen])

  // Real-time subscription for new activity
  useEffect(() => {
    if (!task || !isOpen || usingSample) return

    const channel = supabase
      .channel(`task-activity-${task.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'task_activity',
          filter: `task_id=eq.${task.id}`,
        },
        (payload) => {
          setActivities(prev => [...prev, payload.new])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [task?.id, isOpen, usingSample])

  // Auto-scroll to bottom on new activity
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [activities])

  if (!task) return null

  const priorityConfig = {
    urgent: { color: 'text-red-600', bg: 'bg-red-50' },
    high: { color: 'text-orange-600', bg: 'bg-orange-50' },
    medium: { color: 'text-blue-600', bg: 'bg-blue-50' },
    low: { color: 'text-slate-500', bg: 'bg-slate-50' },
  }
  const prio = priorityConfig[task.priority] || priorityConfig.medium

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div className={`fixed top-0 right-0 h-full w-full max-w-lg bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-out flex flex-col ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        {/* Header */}
        <div className="p-5 border-b border-border flex-shrink-0">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <span className={`badge ${priorityColors[task.priority] || 'badge-neutral'}`}>
                  {task.priority}
                </span>
                {isWorking && (
                  <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-50 border border-blue-200 animate-pulse">
                    <Bot className="w-3 h-3 text-blue-600 animate-spin" style={{ animationDuration: '3s' }} />
                    <span className="text-[10px] font-semibold text-blue-600 uppercase tracking-wide">Working</span>
                  </div>
                )}
              </div>
              <h2 className="text-lg font-semibold text-text">{task.title}</h2>
              {task.description && (
                <p className="text-sm text-text-secondary mt-1">{task.description}</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-surface-hover transition-colors flex-shrink-0"
            >
              <X className="w-5 h-5 text-text-muted" />
            </button>
          </div>

          {/* Task meta */}
          <div className="flex flex-wrap items-center gap-4 mt-4 text-xs text-text-secondary">
            {task.assigned_to && (
              <div className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-text-muted" />
                <span>{task.assigned_to}</span>
              </div>
            )}
            {task.due_date && (
              <div className={`flex items-center gap-1.5 ${getDueDateColor(task.due_date)}`}>
                <Calendar className="w-3.5 h-3.5" />
                <span>{getDueDateLabel(task.due_date)}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-text-muted" />
              <span>{task.status === 'done' ? 'Completed' : task.status === 'in-progress' ? 'In Progress' : 'To Do'}</span>
            </div>
          </div>
        </div>

        {/* Activity Feed */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="px-5 py-3 border-b border-border flex items-center gap-2 flex-shrink-0">
            <Sparkles className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold text-text">Activity Feed</h3>
            {isWorking && (
              <span className="text-[10px] text-text-muted ml-auto">Live updates</span>
            )}
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-5">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 text-primary animate-spin" />
              </div>
            ) : activities.length === 0 ? (
              <div className="text-center py-12">
                <Brain className="w-10 h-10 text-text-muted mx-auto mb-3" />
                <p className="text-sm text-text-muted">No activity yet</p>
                <p className="text-xs text-text-muted mt-1">
                  {isWorking
                    ? 'Niva will post updates here as she works on this task'
                    : 'Activity will appear here when this task is being worked on'}
                </p>
              </div>
            ) : (
              <div>
                {activities.map((activity, i) => (
                  <ActivityItem
                    key={activity.id}
                    activity={activity}
                    isLatest={i === activities.length - 1}
                  />
                ))}
                {isWorking && <ThinkingDots />}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        {usingSample && (
          <div className="p-3 border-t border-border bg-amber-50 flex-shrink-0">
            <p className="text-xs text-amber-700 text-center">
              📋 Run the task_activity SQL migration in Supabase for live updates
            </p>
          </div>
        )}
      </div>
    </>
  )
}

// Sample activity data when the table doesn't exist yet
function getSampleActivity(task) {
  const base = new Date(task.updated_at || task.created_at)
  const isNiva = task.assigned_to?.toLowerCase() === 'niva'

  if (task.status === 'done') {
    return [
      { id: 's1', task_id: task.id, type: 'thinking', message: 'Analyzing task requirements and breaking down into subtasks...', created_at: new Date(base.getTime() - 300000).toISOString() },
      { id: 's2', task_id: task.id, type: 'progress', message: 'Started implementation. Setting up the necessary files and configurations.', created_at: new Date(base.getTime() - 240000).toISOString() },
      { id: 's3', task_id: task.id, type: 'milestone', message: 'Core functionality implemented and tested.', created_at: new Date(base.getTime() - 120000).toISOString() },
      { id: 's4', task_id: task.id, type: 'progress', message: 'Running final checks, building, and deploying...', created_at: new Date(base.getTime() - 60000).toISOString() },
      { id: 's5', task_id: task.id, type: 'complete', message: 'Task completed and deployed successfully. Report sent to Richard.', created_at: base.toISOString() },
    ]
  }

  if (task.status === 'in-progress' && isNiva) {
    return [
      { id: 's1', task_id: task.id, type: 'thinking', message: 'Reviewing task scope and identifying dependencies...', created_at: new Date(base.getTime() - 60000).toISOString() },
      { id: 's2', task_id: task.id, type: 'progress', message: 'Working on implementation. Breaking this into manageable pieces.', created_at: new Date(base.getTime() - 30000).toISOString() },
    ]
  }

  return []
}
