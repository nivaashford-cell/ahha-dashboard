import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  Plus, Search, FileBarChart, Clock, CheckCircle2,
  XCircle, Loader2, Download, Eye, Trash2,
  AlertTriangle, BarChart3, RefreshCw,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { formatDateTime, formatDate, automationStatusColors } from '@/lib/helpers'
import Modal from '@/components/ui/Modal'
import EmptyState from '@/components/ui/EmptyState'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

const reportTypes = ['Payroll', 'Staff Hours', 'Patient Summary', 'Compliance', 'Financial', 'Weekly Summary', 'Custom']

const statusIcons = {
  success: CheckCircle2,
  failed: XCircle,
  pending: Clock,
}

export default function ReportsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [reports, setReports] = useState([])
  const [automationLogs, setAutomationLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [deleteReport, setDeleteReport] = useState(null)
  const [activeTab, setActiveTab] = useState('reports')
  const [searchQuery, setSearchQuery] = useState('')

  const [form, setForm] = useState({ type: 'Payroll', title: '', data: '', status: 'pending' })

  useEffect(() => {
    if (searchParams.get('new') === '1') {
      setShowModal(true)
      setSearchParams({})
    }
  }, [searchParams])

  useEffect(() => { fetchData() }, [])

  async function fetchData() {
    setLoading(true)
    const [reportsRes, logsRes] = await Promise.all([
      supabase.from('reports').select('*').order('created_at', { ascending: false }),
      supabase.from('automation_logs').select('*').order('ran_at', { ascending: false }).limit(50),
    ])
    setReports(reportsRes.data || [])
    setAutomationLogs(logsRes.data || [])
    setLoading(false)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    try {
      const { error } = await supabase.from('reports').insert(form)
      if (error) throw error
      setShowModal(false)
      setForm({ type: 'Payroll', title: '', data: '', status: 'pending' })
      fetchData()
    } catch (err) {
      alert('Error: ' + err.message)
    }
    setSaving(false)
  }

  async function handleDelete() {
    if (!deleteReport) return
    await supabase.from('reports').delete().eq('id', deleteReport.id)
    setDeleteReport(null)
    fetchData()
  }

  async function updateReportStatus(id, status) {
    await supabase.from('reports').update({ status }).eq('id', id)
    fetchData()
  }

  const filteredReports = reports.filter(r => {
    const q = searchQuery.toLowerCase()
    return !q || r.title?.toLowerCase().includes(q) || r.type?.toLowerCase().includes(q)
  })

  if (loading) return <LoadingSpinner />

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-slate-100 rounded-xl w-fit">
        <button onClick={() => setActiveTab('reports')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'reports' ? 'bg-white text-text shadow-sm' : 'text-text-muted hover:text-text'}`}>
          <FileBarChart className="w-4 h-4 inline-block mr-1.5 -mt-0.5" />Reports
        </button>
        <button onClick={() => setActiveTab('automations')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'automations' ? 'bg-white text-text shadow-sm' : 'text-text-muted hover:text-text'}`}>
          <RefreshCw className="w-4 h-4 inline-block mr-1.5 -mt-0.5" />Automation Logs
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input type="text" placeholder="Search reports..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="input pl-10" />
        </div>
        {activeTab === 'reports' && (
          <button onClick={() => setShowModal(true)} className="btn btn-primary">
            <Plus className="w-4 h-4" /> New Report
          </button>
        )}
      </div>

      {/* Reports Tab */}
      {activeTab === 'reports' && (
        filteredReports.length === 0 ? (
          <EmptyState icon={FileBarChart} title="No reports yet" description="Create your first report to start tracking agency data." action={
            <button onClick={() => setShowModal(true)} className="btn btn-primary"><Plus className="w-4 h-4" /> New Report</button>
          } />
        ) : (
          <div className="card overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-surface-alt">
                  <th className="text-left text-xs font-medium text-text-muted px-4 py-3">Report</th>
                  <th className="text-left text-xs font-medium text-text-muted px-4 py-3">Type</th>
                  <th className="text-left text-xs font-medium text-text-muted px-4 py-3">Status</th>
                  <th className="text-left text-xs font-medium text-text-muted px-4 py-3">Created</th>
                  <th className="text-right text-xs font-medium text-text-muted px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredReports.map(report => {
                  const StatusIcon = statusIcons[report.status] || Clock
                  return (
                    <tr key={report.id} className="hover:bg-surface-hover transition-colors">
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-text">{report.title}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="badge badge-info">{report.type}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`badge ${automationStatusColors[report.status] || 'badge-neutral'} inline-flex items-center gap-1`}>
                          <StatusIcon className="w-3 h-3" />
                          {report.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-text-secondary">{formatDateTime(report.created_at)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <select
                            value={report.status}
                            onChange={(e) => updateReportStatus(report.id, e.target.value)}
                            className="text-xs border border-border rounded-lg px-2 py-1 bg-white"
                          >
                            <option value="pending">Pending</option>
                            <option value="success">Complete</option>
                            <option value="failed">Failed</option>
                          </select>
                          <button onClick={() => setDeleteReport(report)} className="p-1.5 rounded-lg hover:bg-red-50">
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
        )
      )}

      {/* Automation Logs Tab */}
      {activeTab === 'automations' && (
        automationLogs.length === 0 ? (
          <EmptyState icon={RefreshCw} title="No automation logs" description="Automation run logs will appear here." />
        ) : (
          <div className="card overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-surface-alt">
                  <th className="text-left text-xs font-medium text-text-muted px-4 py-3">Automation</th>
                  <th className="text-left text-xs font-medium text-text-muted px-4 py-3">Status</th>
                  <th className="text-left text-xs font-medium text-text-muted px-4 py-3">Details</th>
                  <th className="text-left text-xs font-medium text-text-muted px-4 py-3">Ran At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {automationLogs.map(log => {
                  const StatusIcon = statusIcons[log.status] || Clock
                  return (
                    <tr key={log.id} className="hover:bg-surface-hover transition-colors">
                      <td className="px-4 py-3 text-sm font-medium text-text">{log.automation_type}</td>
                      <td className="px-4 py-3">
                        <span className={`badge ${automationStatusColors[log.status] || 'badge-neutral'} inline-flex items-center gap-1`}>
                          <StatusIcon className="w-3 h-3" />{log.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-text-secondary">{log.details || '—'}</td>
                      <td className="px-4 py-3 text-sm text-text-secondary">{formatDateTime(log.ran_at)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )
      )}

      {/* New Report Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="New Report" size="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Title *</label>
            <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input" placeholder="Report title" required />
          </div>
          <div>
            <label className="label">Type</label>
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="input">
              {reportTypes.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Data / Notes</label>
            <textarea value={form.data} onChange={(e) => setForm({ ...form, data: e.target.value })} className="input min-h-[100px] resize-y" placeholder="Report data or notes..." rows={4} />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">Cancel</button>
            <button type="submit" disabled={saving} className="btn btn-primary">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Report'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog isOpen={!!deleteReport} onClose={() => setDeleteReport(null)} onConfirm={handleDelete} title="Delete Report" message={`Delete "${deleteReport?.title}"?`} />
    </div>
  )
}
