import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  Plus, Search, Handshake, Users, CheckSquare,
  Trash2, Edit3, Loader2, Calendar, Activity,
  ChevronDown, ChevronUp, Clock, Star,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { formatDate, formatRelative, truncate } from '@/lib/helpers'
import Modal from '@/components/ui/Modal'
import EmptyState from '@/components/ui/EmptyState'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

const collabStatuses = [
  { value: 'planning', label: 'Planning', color: 'badge-neutral' },
  { value: 'active', label: 'Active', color: 'badge-info' },
  { value: 'on-hold', label: 'On Hold', color: 'badge-warning' },
  { value: 'completed', label: 'Completed', color: 'badge-success' },
]

export default function CollaborationsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { user } = useAuth()
  const [collaborations, setCollaborations] = useState([])
  const [activities, setActivities] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [editingCollab, setEditingCollab] = useState(null)
  const [deleteCollab, setDeleteCollab] = useState(null)
  const [expandedId, setExpandedId] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  const [form, setForm] = useState({ name: '', description: '', status: 'planning' })

  useEffect(() => {
    if (searchParams.get('new') === '1') {
      setShowModal(true)
      setSearchParams({})
    }
  }, [searchParams])

  useEffect(() => { fetchCollaborations() }, [])

  async function fetchCollaborations() {
    setLoading(true)
    const { data, error } = await supabase
      .from('collaborations')
      .select('*')
      .order('created_at', { ascending: false })
    if (!error) setCollaborations(data || [])
    setLoading(false)
  }

  async function fetchActivity(collabId) {
    const { data } = await supabase
      .from('activity_log')
      .select('*')
      .eq('entity_type', 'collaboration')
      .eq('entity_id', collabId)
      .order('created_at', { ascending: false })
      .limit(10)
    setActivities(prev => ({ ...prev, [collabId]: data || [] }))
  }

  function toggleExpanded(id) {
    if (expandedId === id) {
      setExpandedId(null)
    } else {
      setExpandedId(id)
      if (!activities[id]) fetchActivity(id)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    try {
      if (editingCollab) {
        const { error } = await supabase.from('collaborations')
          .update({ ...form, updated_at: new Date().toISOString() })
          .eq('id', editingCollab.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('collaborations')
          .insert({ ...form, created_by: user?.id })
        if (error) throw error
      }
      setShowModal(false)
      setEditingCollab(null)
      setForm({ name: '', description: '', status: 'planning' })
      fetchCollaborations()
    } catch (err) {
      alert('Error: ' + err.message)
    }
    setSaving(false)
  }

  async function handleDelete() {
    if (!deleteCollab) return
    await supabase.from('collaborations').delete().eq('id', deleteCollab.id)
    setDeleteCollab(null)
    fetchCollaborations()
  }

  async function updateStatus(id, status) {
    await supabase.from('collaborations').update({ status, updated_at: new Date().toISOString() }).eq('id', id)
    fetchCollaborations()
  }

  const filtered = collaborations.filter(c => {
    const q = searchQuery.toLowerCase()
    if (q && !c.name?.toLowerCase().includes(q) && !c.description?.toLowerCase().includes(q)) return false
    if (filterStatus !== 'all' && c.status !== filterStatus) return false
    return true
  })

  if (loading) return <LoadingSpinner />

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input type="text" placeholder="Search projects..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="input pl-10" />
        </div>
        <div className="flex gap-2">
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="input w-auto">
            <option value="all">All Statuses</option>
            {collabStatuses.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          <button onClick={() => { setEditingCollab(null); setForm({ name: '', description: '', status: 'planning' }); setShowModal(true) }} className="btn btn-primary">
            <Plus className="w-4 h-4" /> <span className="hidden sm:inline">New Project</span>
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Handshake} title="No projects yet" description="Start tracking your agency collaborations and initiatives."
          action={<button onClick={() => setShowModal(true)} className="btn btn-primary"><Plus className="w-4 h-4" /> New Project</button>}
        />
      ) : (
        <div className="space-y-3">
          {filtered.map(collab => {
            const statusInfo = collabStatuses.find(s => s.value === collab.status) || collabStatuses[0]
            const isExpanded = expandedId === collab.id
            return (
              <div key={collab.id} className="card overflow-hidden">
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-base font-semibold text-text">{collab.name}</h3>
                        <span className={`badge ${statusInfo.color}`}>{statusInfo.label}</span>
                      </div>
                      {collab.description && (
                        <p className="text-sm text-text-secondary mt-1">{truncate(collab.description, 150)}</p>
                      )}
                      <div className="flex items-center gap-4 mt-3 text-xs text-text-muted">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          Created {formatDate(collab.created_at)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <select
                        value={collab.status}
                        onChange={(e) => updateStatus(collab.id, e.target.value)}
                        className="text-xs border border-border rounded-lg px-2 py-1 bg-white"
                      >
                        {collabStatuses.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                      </select>
                      <button onClick={() => { setEditingCollab(collab); setForm({ name: collab.name, description: collab.description || '', status: collab.status }); setShowModal(true) }}
                        className="p-1.5 rounded-lg hover:bg-surface-hover">
                        <Edit3 className="w-4 h-4 text-text-muted" />
                      </button>
                      <button onClick={() => setDeleteCollab(collab)} className="p-1.5 rounded-lg hover:bg-red-50">
                        <Trash2 className="w-4 h-4 text-text-muted hover:text-danger" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Activity Toggle */}
                <button
                  onClick={() => toggleExpanded(collab.id)}
                  className="w-full flex items-center justify-center gap-1.5 py-2.5 border-t border-border text-xs font-medium text-text-muted hover:bg-surface-hover transition-colors"
                >
                  <Activity className="w-3.5 h-3.5" />
                  Activity Log
                  {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>

                {isExpanded && (
                  <div className="border-t border-border bg-surface-alt p-4">
                    {!activities[collab.id] || activities[collab.id].length === 0 ? (
                      <p className="text-xs text-text-muted text-center py-4">No activity logged yet</p>
                    ) : (
                      <div className="space-y-3">
                        {activities[collab.id].map(act => (
                          <div key={act.id} className="flex items-start gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                            <div>
                              <p className="text-sm text-text">{act.action}: {act.details}</p>
                              <p className="text-xs text-text-muted">{formatRelative(act.created_at)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Modal */}
      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setEditingCollab(null) }} title={editingCollab ? 'Edit Project' : 'New Project'} size="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Project Name *</label>
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" placeholder="Project name" required />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input min-h-[100px] resize-y" placeholder="What is this project about?" rows={3} />
          </div>
          <div>
            <label className="label">Status</label>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="input">
              {collabStatuses.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => { setShowModal(false); setEditingCollab(null) }} className="btn btn-secondary">Cancel</button>
            <button type="submit" disabled={saving} className="btn btn-primary">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : (editingCollab ? 'Update' : 'Create Project')}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog isOpen={!!deleteCollab} onClose={() => setDeleteCollab(null)} onConfirm={handleDelete} title="Delete Project" message={`Delete "${deleteCollab?.name}"? This cannot be undone.`} />
    </div>
  )
}
