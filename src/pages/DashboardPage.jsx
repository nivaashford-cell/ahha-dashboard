import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  CheckSquare, Users, FileBarChart, Handshake,
  Plus, ArrowUpRight, Clock, AlertTriangle,
  TrendingUp, Activity, Calendar, Star,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { formatRelative, statusColors, priorityColors } from '@/lib/helpers'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

function StatCard({ icon: Icon, label, value, color, to }) {
  return (
    <Link to={to} className="card p-5 hover:shadow-md transition-all group">
      <div className="flex items-start justify-between">
        <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <ArrowUpRight className="w-4 h-4 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
      <p className="text-2xl font-bold text-text mt-3">{value}</p>
      <p className="text-sm text-text-muted">{label}</p>
    </Link>
  )
}

function QuickAction({ icon: Icon, label, to }) {
  return (
    <Link to={to} className="flex items-center gap-3 p-3 rounded-lg hover:bg-surface-hover transition-colors">
      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
        <Icon className="w-4 h-4 text-primary" />
      </div>
      <span className="text-sm font-medium text-text">{label}</span>
    </Link>
  )
}

export default function DashboardPage() {
  const [stats, setStats] = useState({ tasks: 0, contacts: 0, reports: 0, collaborations: 0 })
  const [recentTasks, setRecentTasks] = useState([])
  const [recentActivity, setRecentActivity] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [tasksRes, contactsRes, reportsRes, collabsRes, recentTasksRes, activityRes] = await Promise.all([
          supabase.from('tasks').select('id', { count: 'exact' }).neq('status', 'done'),
          supabase.from('contacts').select('id', { count: 'exact' }),
          supabase.from('reports').select('id', { count: 'exact' }).eq('status', 'pending'),
          supabase.from('collaborations').select('id', { count: 'exact' }).neq('status', 'completed'),
          supabase.from('tasks').select('*').order('created_at', { ascending: false }).limit(5),
          supabase.from('activity_log').select('*').order('created_at', { ascending: false }).limit(8),
        ])

        setStats({
          tasks: tasksRes.count || 0,
          contacts: contactsRes.count || 0,
          reports: reportsRes.count || 0,
          collaborations: collabsRes.count || 0,
        })
        setRecentTasks(recentTasksRes.data || [])
        setRecentActivity(activityRes.data || [])
      } catch (err) {
        console.error('Dashboard load error:', err)
      } finally {
        setLoading(false)
      }
    }
    loadDashboard()
  }, [])

  if (loading) return <LoadingSpinner />

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={CheckSquare} label="Open Tasks" value={stats.tasks} color="bg-primary" to="/tasks" />
        <StatCard icon={Users} label="Total Contacts" value={stats.contacts} color="bg-secondary" to="/contacts" />
        <StatCard icon={FileBarChart} label="Pending Reports" value={stats.reports} color="bg-accent" to="/reports" />
        <StatCard icon={Handshake} label="Active Projects" value={stats.collaborations} color="bg-purple-500" to="/collaborations" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Tasks */}
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between p-5 border-b border-border">
            <h3 className="font-semibold text-text">Recent Tasks</h3>
            <Link to="/tasks" className="text-sm text-primary hover:text-primary-dark">View all</Link>
          </div>
          <div className="divide-y divide-border">
            {recentTasks.length === 0 ? (
              <div className="p-8 text-center text-sm text-text-muted">No tasks yet. Create your first task!</div>
            ) : (
              recentTasks.map(task => (
                <div key={task.id} className="flex items-center gap-3 p-4 hover:bg-surface-hover transition-colors">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                    task.priority === 'urgent' ? 'bg-danger' :
                    task.priority === 'high' ? 'bg-warning' :
                    task.priority === 'medium' ? 'bg-secondary-light' : 'bg-text-muted'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text truncate">{task.title}</p>
                    <p className="text-xs text-text-muted">{formatRelative(task.created_at)}</p>
                  </div>
                  <span className={`badge ${statusColors[task.status] || 'badge-neutral'}`}>
                    {task.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Actions & Activity */}
        <div className="space-y-6">
          <div className="card p-5">
            <h3 className="font-semibold text-text mb-3">Quick Actions</h3>
            <div className="space-y-1">
              <QuickAction icon={Plus} label="New Task" to="/tasks?new=1" />
              <QuickAction icon={Users} label="Add Contact" to="/contacts?new=1" />
              <QuickAction icon={FileBarChart} label="New Report" to="/reports?new=1" />
              <QuickAction icon={Handshake} label="New Project" to="/collaborations?new=1" />
            </div>
          </div>

          <div className="card">
            <div className="p-5 border-b border-border">
              <h3 className="font-semibold text-text">Recent Activity</h3>
            </div>
            <div className="divide-y divide-border">
              {recentActivity.length === 0 ? (
                <div className="p-6 text-center text-sm text-text-muted">No activity yet</div>
              ) : (
                recentActivity.map(item => (
                  <div key={item.id} className="p-3 px-5">
                    <p className="text-sm text-text">{item.action} <span className="text-text-muted">{item.entity_type}</span></p>
                    <p className="text-xs text-text-muted">{formatRelative(item.created_at)}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
