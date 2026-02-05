import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  Plus, Search, Filter, LayoutGrid, List,
  Calendar, Trash2, Edit3, GripVertical,
  CheckCircle2, Circle, Clock, Loader2, Bot,
} from 'lucide-react'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { statusColors, priorityColors, formatDate, getDueDateLabel, getDueDateColor, truncate } from '@/lib/helpers'
import Modal from '@/components/ui/Modal'
import TaskForm from '@/components/tasks/TaskForm'
import EmptyState from '@/components/ui/EmptyState'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

const columns = [
  { id: 'todo', title: 'To Do', icon: Circle, color: 'bg-slate-400' },
  { id: 'in-progress', title: 'In Progress', icon: Clock, color: 'bg-blue-500' },
  { id: 'done', title: 'Done', icon: CheckCircle2, color: 'bg-green-500' },
]

function WorkingIndicator() {
  return (
    <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-blue-50 border border-blue-200 animate-pulse">
      <Bot className="w-3 h-3 text-blue-600 animate-spin" style={{ animationDuration: '3s' }} />
      <span className="text-[10px] font-semibold text-blue-600 uppercase tracking-wide">Niva working</span>
    </div>
  )
}

export default function TasksPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { user } = useAuth()
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [deleteTask, setDeleteTask] = useState(null)
  const [view, setView] = useState('kanban')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterPriority, setFilterPriority] = useState('all')
  const [filterAssignee, setFilterAssignee] = useState('all')
  const [updatingTaskId, setUpdatingTaskId] = useState(null)

  useEffect(() => {
    if (searchParams.get('new') === '1') {
      setShowModal(true)
      setSearchParams({})
    }
  }, [searchParams])

  useEffect(() => {
    fetchTasks()
  }, [])

  async function fetchTasks() {
    setLoading(true)
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false })
    if (!error) setTasks(data || [])
    setLoading(false)
  }

  async function handleSubmit(form) {
    setSaving(true)
    try {
      if (editingTask) {
        const { error } = await supabase
          .from('tasks')
          .update({ ...form, updated_at: new Date().toISOString() })
          .eq('id', editingTask.id)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('tasks')
          .insert({ ...form, created_by: user?.id })
        if (error) throw error
      }
      await fetchTasks()
      setShowModal(false)
      setEditingTask(null)
    } catch (err) {
      alert('Error saving task: ' + err.message)
    }
    setSaving(false)
  }

  async function handleDelete() {
    if (!deleteTask) return
    await supabase.from('tasks').delete().eq('id', deleteTask.id)
    setDeleteTask(null)
    fetchTasks()
  }

  async function handleStatusChange(taskId, newStatus) {
    setUpdatingTaskId(taskId)
    await supabase
      .from('tasks')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', taskId)
    await fetchTasks()
    setUpdatingTaskId(null)
  }

  function onDragEnd(result) {
    const { destination, source, draggableId } = result
    if (!destination) return
    if (destination.droppableId === source.droppableId && destination.index === source.index) return
    const newStatus = destination.droppableId
    // Optimistically update the task in state
    setTasks(prev => prev.map(t => t.id === draggableId ? { ...t, status: newStatus } : t))
    // Persist to database
    handleStatusChange(draggableId, newStatus)
  }

  const isNivaWorking = (task) => {
    return task.status === 'in-progress' && task.assigned_to?.toLowerCase() === 'niva'
  }

  const filteredTasks = tasks.filter(t => {
    if (searchQuery && !t.title.toLowerCase().includes(searchQuery.toLowerCase())) return false
    if (filterPriority !== 'all' && t.priority !== filterPriority) return false
    if (filterAssignee !== 'all' && t.assigned_to !== filterAssignee) return false
    return true
  })

  const assignees = [...new Set(tasks.map(t => t.assigned_to).filter(Boolean))]

  if (loading) return <LoadingSpinner />

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input pl-10"
          />
        </div>
        <div className="flex gap-2">
          <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)} className="input w-auto">
            <option value="all">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
          <select value={filterAssignee} onChange={(e) => setFilterAssignee(e.target.value)} className="input w-auto">
            <option value="all">All Assignees</option>
            {assignees.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
          <div className="flex rounded-lg border border-border overflow-hidden">
            <button
              onClick={() => setView('kanban')}
              className={`p-2.5 ${view === 'kanban' ? 'bg-primary text-white' : 'bg-white text-text-secondary hover:bg-surface-hover'}`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setView('list')}
              className={`p-2.5 ${view === 'list' ? 'bg-primary text-white' : 'bg-white text-text-secondary hover:bg-surface-hover'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
          <button onClick={() => { setEditingTask(null); setShowModal(true) }} className="btn btn-primary">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New Task</span>
          </button>
        </div>
      </div>

      {/* Kanban View */}
      {view === 'kanban' ? (
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {columns.map(col => {
              const colTasks = filteredTasks.filter(t => t.status === col.id)
              return (
                <Droppable droppableId={col.id} key={col.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`rounded-xl p-3 min-h-[200px] transition-colors duration-200 ${
                        snapshot.isDraggingOver
                          ? 'bg-primary/5 ring-2 ring-primary/20 ring-dashed'
                          : 'bg-slate-100/80'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-3 px-1">
                        <div className={`w-2.5 h-2.5 rounded-full ${col.color}`} />
                        <h3 className="text-sm font-semibold text-text">{col.title}</h3>
                        <span className="text-xs text-text-muted bg-white rounded-full px-2 py-0.5">{colTasks.length}</span>
                      </div>
                      <div className="space-y-2">
                        {colTasks.map((task, index) => (
                          <Draggable key={task.id} draggableId={task.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className={`card p-3.5 transition-all group relative ${
                                  snapshot.isDragging
                                    ? 'shadow-lg ring-2 ring-primary/30 rotate-[2deg] scale-[1.02]'
                                    : 'hover:shadow-md'
                                } ${
                                  isNivaWorking(task)
                                    ? 'ring-2 ring-blue-400/50 bg-gradient-to-br from-white to-blue-50/50'
                                    : ''
                                } ${
                                  updatingTaskId === task.id ? 'opacity-60' : ''
                                }`}
                              >
                                {/* Drag handle */}
                                <div
                                  {...provided.dragHandleProps}
                                  className="absolute left-1 top-1/2 -translate-y-1/2 p-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
                                >
                                  <GripVertical className="w-3.5 h-3.5 text-text-muted" />
                                </div>

                                <div className="pl-3">
                                  <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span className={`badge ${priorityColors[task.priority] || 'badge-neutral'}`}>
                                        {task.priority}
                                      </span>
                                      {isNivaWorking(task) && <WorkingIndicator />}
                                    </div>
                                    <div className="flex items-center gap-1">
                                      {updatingTaskId === task.id && (
                                        <Loader2 className="w-3.5 h-3.5 text-primary animate-spin" />
                                      )}
                                      <button
                                        onClick={(e) => { e.stopPropagation(); setDeleteTask(task) }}
                                        className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-red-50 transition-all"
                                      >
                                        <Trash2 className="w-3.5 h-3.5 text-text-muted hover:text-danger" />
                                      </button>
                                    </div>
                                  </div>
                                  <h4
                                    className="text-sm font-medium text-text mb-1 cursor-pointer hover:text-primary transition-colors"
                                    onClick={() => { setEditingTask(task); setShowModal(true) }}
                                  >
                                    {task.title}
                                  </h4>
                                  {task.description && (
                                    <p className="text-xs text-text-muted mb-2">{truncate(task.description, 80)}</p>
                                  )}
                                  <div className="flex items-center justify-between text-xs">
                                    {task.due_date && (
                                      <span className={`flex items-center gap-1 ${getDueDateColor(task.due_date)}`}>
                                        <Calendar className="w-3 h-3" />
                                        {getDueDateLabel(task.due_date)}
                                      </span>
                                    )}
                                    {task.assigned_to && (
                                      <span className={`${isNivaWorking(task) ? 'text-blue-600 font-medium' : 'text-text-muted'}`}>
                                        {task.assigned_to}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                        {colTasks.length === 0 && !snapshot.isDraggingOver && (
                          <div className="text-center py-8 text-xs text-text-muted">No tasks</div>
                        )}
                        {colTasks.length === 0 && snapshot.isDraggingOver && (
                          <div className="text-center py-8 text-xs text-primary font-medium">Drop here</div>
                        )}
                      </div>
                    </div>
                  )}
                </Droppable>
              )
            })}
          </div>
        </DragDropContext>
      ) : (
        /* List View */
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-surface-alt">
                  <th className="text-left text-xs font-medium text-text-muted px-4 py-3">Title</th>
                  <th className="text-left text-xs font-medium text-text-muted px-4 py-3">Status</th>
                  <th className="text-left text-xs font-medium text-text-muted px-4 py-3">Priority</th>
                  <th className="text-left text-xs font-medium text-text-muted px-4 py-3">Due Date</th>
                  <th className="text-left text-xs font-medium text-text-muted px-4 py-3">Assigned To</th>
                  <th className="text-right text-xs font-medium text-text-muted px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredTasks.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-12 text-sm text-text-muted">No tasks found</td></tr>
                ) : (
                  filteredTasks.map(task => (
                    <tr key={task.id} className={`transition-colors ${
                      isNivaWorking(task)
                        ? 'bg-blue-50/50 hover:bg-blue-50'
                        : 'hover:bg-surface-hover'
                    }`}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div>
                            <p className="text-sm font-medium text-text">{task.title}</p>
                            {task.description && <p className="text-xs text-text-muted mt-0.5">{truncate(task.description, 60)}</p>}
                          </div>
                          {isNivaWorking(task) && <WorkingIndicator />}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={task.status}
                          onChange={(e) => handleStatusChange(task.id, e.target.value)}
                          className="text-xs rounded-lg border border-border px-2 py-1 bg-white"
                        >
                          {columns.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`badge ${priorityColors[task.priority] || 'badge-neutral'}`}>{task.priority}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-sm ${getDueDateColor(task.due_date)}`}>
                          {task.due_date ? formatDate(task.due_date) : '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-text-secondary">
                        {task.assigned_to || '—'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {updatingTaskId === task.id && (
                            <Loader2 className="w-4 h-4 text-primary animate-spin" />
                          )}
                          <button onClick={() => { setEditingTask(task); setShowModal(true) }} className="p-1.5 rounded-lg hover:bg-surface-hover">
                            <Edit3 className="w-4 h-4 text-text-muted" />
                          </button>
                          <button onClick={() => setDeleteTask(task)} className="p-1.5 rounded-lg hover:bg-red-50">
                            <Trash2 className="w-4 h-4 text-text-muted hover:text-danger" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Task Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setEditingTask(null) }}
        title={editingTask ? 'Edit Task' : 'New Task'}
        size="md"
      >
        <TaskForm
          task={editingTask}
          onSubmit={handleSubmit}
          onCancel={() => { setShowModal(false); setEditingTask(null) }}
          loading={saving}
        />
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTask}
        onClose={() => setDeleteTask(null)}
        onConfirm={handleDelete}
        title="Delete Task"
        message={`Are you sure you want to delete "${deleteTask?.title}"? This action cannot be undone.`}
      />
    </div>
  )
}
