import { useState, useEffect } from 'react'
import {
  Plus, Search, Zap, Play, Pause, Clock,
  Mail, MessageCircle, FileBarChart, Loader2,
  Trash2, Edit3, RefreshCw, Calendar, Bell,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { formatDateTime } from '@/lib/helpers'
import Modal from '@/components/ui/Modal'
import EmptyState from '@/components/ui/EmptyState'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

const triggerTypes = [
  { value: 'schedule', label: 'Schedule', icon: Calendar },
  { value: 'event', label: 'Event', icon: Zap },
]

const actionTypes = [
  { value: 'email', label: 'Send Email', icon: Mail },
  { value: 'whatsapp', label: 'Send WhatsApp', icon: MessageCircle },
  { value: 'report', label: 'Generate Report', icon: FileBarChart },
]

const triggerIcons = { schedule: Calendar, event: Zap }
const actionIcons = { email: Mail, whatsapp: MessageCircle, report: FileBarChart }

// Sample automations for initial display
const SAMPLE_AUTOMATIONS = [
  {
    id: 'sample-1',
    name: 'Daily Clock-in Alert',
    trigger_type: 'schedule',
    action_type: 'email',
    config: { schedule: 'Every day at 8:00 AM', recipients: 'admin@ahha.com' },
    status: 'active',
    last_run: new Date(Date.now() - 86400000).toISOString(),
    created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
  },
  {
    id: 'sample-2',
    name: 'Biweekly Payroll Reminder',
    trigger_type: 'schedule',
    action_type: 'email',
    config: { schedule: 'Every 2 weeks on Friday', recipients: 'payroll@ahha.com' },
    status: 'active',
    last_run: new Date(Date.now() - 3 * 86400000).toISOString(),
    created_at: new Date(Date.now() - 14 * 86400000).toISOString(),
  },
  {
    id: 'sample-3',
    name: 'Weekly Staff Summary',
    trigger_type: 'schedule',
    action_type: 'report',
    config: { schedule: 'Every Monday at 9:00 AM', report_type: 'Staff Hours' },
    status: 'paused',
    last_run: new Date(Date.now() - 10 * 86400000).toISOString(),
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
  },
]

const emptyForm = {
  name: '',
  trigger_type: 'schedule',
  action_type: 'email',
  config: {},
  status: 'active',
}

export default function AutomationsPage() {
  const { user } = useAuth()
  const [automations, setAutomations] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [editingAutomation, setEditingAutomation] = useState(null)
  const [deleteAutomation, setDeleteAutomation] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [form, setForm] = useState(emptyForm)

  useEffect(() => { fetchAutomations() }, [])

  async function fetchAutomations() {
    setLoading(true)
    const { data, error } = await supabase
      .from('automations')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error && data && data.length > 0) {
      setAutomations(data)
    } else {
      // Use sample data if table is empty or doesn't exist yet
      setAutomations(SAMPLE_AUTOMATIONS)
    }
    setLoading(false)
  }

  function openCreate() {
    setEditingAutomation(null)
    setForm(emptyForm)
    setShowModal(true)
  }

  function openEdit(automation) {
    setEditingAutomation(automation)
    setForm({
      name: automation.name,
      trigger_type: automation.trigger_type,
      action_type: automation.action_type,
      config: automation.config || {},
      status: automation.status,
    })
    setShowModal(true)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    try {
      if (editingAutomation && !editingAutomation.id.startsWith('sample-')) {
        const { error } = await supabase
          .from('automations')
          .update({ ...form, updated_at: new Date().toISOString() })
          .eq('id', editingAutomation.id)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('automations')
          .insert({ ...form, created_by: user?.id })
        if (error) throw error
      }
      await fetchAutomations()
      setShowModal(false)
      setEditingAutomation(null)
    } catch (err) {
      alert('Error saving automation: ' + err.message)
    }
    setSaving(false)
  }

  async function handleDelete() {
    if (!deleteAutomation) return
    if (deleteAutomation.id.startsWith('sample-')) {
      // Remove from local state only
      setAutomations(prev => prev.filter(a => a.id !== deleteAutomation.id))
      setDeleteAutomation(null)
      return
    }
    await supabase.from('automations').delete().eq('id', deleteAutomation.id)
    setDeleteAutomation(null)
    fetchAutomations()
  }

  async function toggleStatus(automation) {
    const newStatus = automation.status === 'active' ? 'paused' : 'active'
    if (automation.id.startsWith('sample-')) {
      setAutomations(prev => prev.map(a => a.id === automation.id ? { ...a, status: newStatus } : a))
      return
    }
    await supabase.from('automations').update({ status: newStatus }).eq('id', automation.id)
    fetchAutomations()
  }

  const filtered = automations.filter(a => {
    const q = searchQuery.toLowerCase()
    return !q || a.name.toLowerCase().includes(q) || a.trigger_type.toLowerCase().includes(q) || a.action_type.toLowerCase().includes(q)
  })

  if (loading) return <LoadingSpinner />

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            placeholder="Search automations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input pl-10"
          />
        </div>
        <button onClick={openCreate} className="btn btn-primary">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">New Automation</span>
        </button>
      </div>

      {/* Automations List */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={Zap}
          title="No automations yet"
          description="Create automation rules to streamline your workflow."
          action={
            <button onClick={openCreate} className="btn btn-primary">
              <Plus className="w-4 h-4" /> New Automation
            </button>
          }
        />
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-surface-alt">
                <th className="text-left text-xs font-medium text-text-muted px-4 py-3">Automation</th>
                <th className="text-left text-xs font-medium text-text-muted px-4 py-3">Trigger</th>
                <th className="text-left text-xs font-medium text-text-muted px-4 py-3">Action</th>
                <th className="text-left text-xs font-medium text-text-muted px-4 py-3">Status</th>
                <th className="text-left text-xs font-medium text-text-muted px-4 py-3">Last Run</th>
                <th className="text-right text-xs font-medium text-text-muted px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map(automation => {
                const TriggerIcon = triggerIcons[automation.trigger_type] || Zap
                const ActionIcon = actionIcons[automation.action_type] || Bell
                return (
                  <tr key={automation.id} className="hover:bg-surface-hover transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Zap className="w-4 h-4 text-primary" />
                        </div>
                        <p className="text-sm font-medium text-text">{automation.name}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="badge badge-info inline-flex items-center gap-1">
                        <TriggerIcon className="w-3 h-3" />
                        {automation.trigger_type}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="badge badge-neutral inline-flex items-center gap-1">
                        <ActionIcon className="w-3 h-3" />
                        {automation.action_type}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleStatus(automation)}
                        className={`badge inline-flex items-center gap-1 cursor-pointer ${
                          automation.status === 'active' ? 'badge-success' : 'badge-warning'
                        }`}
                      >
                        {automation.status === 'active' ? (
                          <><Play className="w-3 h-3" /> Active</>
                        ) : (
                          <><Pause className="w-3 h-3" /> Paused</>
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-sm text-text-secondary">
                      {automation.last_run ? formatDateTime(automation.last_run) : 'Never'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(automation)} className="p-1.5 rounded-lg hover:bg-surface-hover">
                          <Edit3 className="w-4 h-4 text-text-muted" />
                        </button>
                        <button onClick={() => setDeleteAutomation(automation)} className="p-1.5 rounded-lg hover:bg-red-50">
                          <Trash2 className="w-4 h-4 text-text-muted hover:text-danger" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setEditingAutomation(null) }}
        title={editingAutomation ? 'Edit Automation' : 'New Automation'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="input"
              placeholder="e.g., Daily Clock-in Alert"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Trigger Type</label>
              <select
                value={form.trigger_type}
                onChange={(e) => setForm({ ...form, trigger_type: e.target.value })}
                className="input"
              >
                {triggerTypes.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Action</label>
              <select
                value={form.action_type}
                onChange={(e) => setForm({ ...form, action_type: e.target.value })}
                className="input"
              >
                {actionTypes.map(a => (
                  <option key={a.value} value={a.value}>{a.label}</option>
                ))}
              </select>
            </div>
          </div>

          {form.trigger_type === 'schedule' && (
            <div>
              <label className="label">Schedule</label>
              <input
                type="text"
                value={form.config.schedule || ''}
                onChange={(e) => setForm({ ...form, config: { ...form.config, schedule: e.target.value } })}
                className="input"
                placeholder="e.g., Every day at 8:00 AM"
              />
            </div>
          )}

          {form.trigger_type === 'event' && (
            <div>
              <label className="label">Event</label>
              <select
                value={form.config.event || ''}
                onChange={(e) => setForm({ ...form, config: { ...form.config, event: e.target.value } })}
                className="input"
              >
                <option value="">Select an event...</option>
                <option value="task_completed">Task Completed</option>
                <option value="task_overdue">Task Overdue</option>
                <option value="new_contact">New Contact Added</option>
                <option value="clock_in_missed">Clock-in Missed</option>
              </select>
            </div>
          )}

          {(form.action_type === 'email' || form.action_type === 'whatsapp') && (
            <div>
              <label className="label">Recipients</label>
              <input
                type="text"
                value={form.config.recipients || ''}
                onChange={(e) => setForm({ ...form, config: { ...form.config, recipients: e.target.value } })}
                className="input"
                placeholder="e.g., admin@ahha.com, staff@ahha.com"
              />
            </div>
          )}

          {form.action_type === 'report' && (
            <div>
              <label className="label">Report Type</label>
              <select
                value={form.config.report_type || ''}
                onChange={(e) => setForm({ ...form, config: { ...form.config, report_type: e.target.value } })}
                className="input"
              >
                <option value="">Select report type...</option>
                <option value="Payroll">Payroll</option>
                <option value="Staff Hours">Staff Hours</option>
                <option value="Weekly Summary">Weekly Summary</option>
                <option value="Compliance">Compliance</option>
              </select>
            </div>
          )}

          <div>
            <label className="label">Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="input"
            >
              <option value="active">Active</option>
              <option value="paused">Paused</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => { setShowModal(false); setEditingAutomation(null) }} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="btn btn-primary">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : (editingAutomation ? 'Save Changes' : 'Create Automation')}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteAutomation}
        onClose={() => setDeleteAutomation(null)}
        onConfirm={handleDelete}
        title="Delete Automation"
        message={`Are you sure you want to delete "${deleteAutomation?.name}"? This action cannot be undone.`}
      />
    </div>
  )
}
