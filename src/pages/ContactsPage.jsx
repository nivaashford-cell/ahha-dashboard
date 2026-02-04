import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  Plus, Search, Phone, Mail, Building2,
  Trash2, Edit3, User, MapPin,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { formatDate, getInitials } from '@/lib/helpers'
import Modal from '@/components/ui/Modal'
import ContactForm from '@/components/contacts/ContactForm'
import EmptyState from '@/components/ui/EmptyState'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

const typeColors = {
  'Client': 'bg-blue-100 text-blue-700',
  'Caregiver': 'bg-green-100 text-green-700',
  'Vendor': 'bg-purple-100 text-purple-700',
  'Partner': 'bg-teal-100 text-teal-700',
  'Staff': 'bg-amber-100 text-amber-700',
  'Referral Source': 'bg-pink-100 text-pink-700',
  'Insurance': 'bg-indigo-100 text-indigo-700',
  'Other': 'bg-slate-100 text-slate-700',
}

export default function ContactsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [contacts, setContacts] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [editingContact, setEditingContact] = useState(null)
  const [deleteContact, setDeleteContact] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState('all')

  useEffect(() => {
    if (searchParams.get('new') === '1') {
      setShowModal(true)
      setSearchParams({})
    }
  }, [searchParams])

  useEffect(() => { fetchContacts() }, [])

  async function fetchContacts() {
    setLoading(true)
    const { data, error } = await supabase.from('contacts').select('*').order('name')
    if (!error) setContacts(data || [])
    setLoading(false)
  }

  async function handleSubmit(form) {
    setSaving(true)
    try {
      if (editingContact) {
        const { error } = await supabase.from('contacts').update({ ...form, updated_at: new Date().toISOString() }).eq('id', editingContact.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('contacts').insert(form)
        if (error) throw error
      }
      await fetchContacts()
      setShowModal(false)
      setEditingContact(null)
    } catch (err) {
      alert('Error: ' + err.message)
    }
    setSaving(false)
  }

  async function handleDelete() {
    if (!deleteContact) return
    await supabase.from('contacts').delete().eq('id', deleteContact.id)
    setDeleteContact(null)
    fetchContacts()
  }

  const filtered = contacts.filter(c => {
    const q = searchQuery.toLowerCase()
    if (q && !c.name?.toLowerCase().includes(q) && !c.email?.toLowerCase().includes(q) && !c.company?.toLowerCase().includes(q)) return false
    if (filterType !== 'all' && c.relationship_type !== filterType) return false
    return true
  })

  const types = [...new Set(contacts.map(c => c.relationship_type).filter(Boolean))]

  if (loading) return <LoadingSpinner />

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input type="text" placeholder="Search contacts..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="input pl-10" />
        </div>
        <div className="flex gap-2">
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="input w-auto">
            <option value="all">All Types</option>
            {types.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <button onClick={() => { setEditingContact(null); setShowModal(true) }} className="btn btn-primary">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Contact</span>
          </button>
        </div>
      </div>

      {/* Contact Grid */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={User}
          title="No contacts found"
          description="Add your first contact to get started managing your network."
          action={
            <button onClick={() => setShowModal(true)} className="btn btn-primary">
              <Plus className="w-4 h-4" /> Add Contact
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(contact => (
            <div key={contact.id} className="card p-5 hover:shadow-md transition-all group">
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-semibold text-primary">{getInitials(contact.name)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-text">{contact.name}</h3>
                      {contact.role && <p className="text-xs text-text-muted">{contact.role}</p>}
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => { setEditingContact(contact); setShowModal(true) }} className="p-1 rounded hover:bg-surface-hover">
                        <Edit3 className="w-3.5 h-3.5 text-text-muted" />
                      </button>
                      <button onClick={() => setDeleteContact(contact)} className="p-1 rounded hover:bg-red-50">
                        <Trash2 className="w-3.5 h-3.5 text-text-muted hover:text-danger" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-3 space-y-1.5">
                {contact.email && (
                  <div className="flex items-center gap-2 text-xs text-text-secondary">
                    <Mail className="w-3.5 h-3.5 text-text-muted flex-shrink-0" />
                    <a href={`mailto:${contact.email}`} className="truncate hover:text-primary">{contact.email}</a>
                  </div>
                )}
                {contact.phone && (
                  <div className="flex items-center gap-2 text-xs text-text-secondary">
                    <Phone className="w-3.5 h-3.5 text-text-muted flex-shrink-0" />
                    <a href={`tel:${contact.phone}`} className="hover:text-primary">{contact.phone}</a>
                  </div>
                )}
                {contact.company && (
                  <div className="flex items-center gap-2 text-xs text-text-secondary">
                    <Building2 className="w-3.5 h-3.5 text-text-muted flex-shrink-0" />
                    <span className="truncate">{contact.company}</span>
                  </div>
                )}
              </div>

              <div className="mt-3 flex items-center justify-between">
                {contact.relationship_type ? (
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${typeColors[contact.relationship_type] || typeColors['Other']}`}>
                    {contact.relationship_type}
                  </span>
                ) : <span />}
                {contact.last_contact_date && (
                  <span className="text-xs text-text-muted">Last: {formatDate(contact.last_contact_date)}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setEditingContact(null) }} title={editingContact ? 'Edit Contact' : 'New Contact'} size="md">
        <ContactForm contact={editingContact} onSubmit={handleSubmit} onCancel={() => { setShowModal(false); setEditingContact(null) }} loading={saving} />
      </Modal>

      <ConfirmDialog isOpen={!!deleteContact} onClose={() => setDeleteContact(null)} onConfirm={handleDelete} title="Delete Contact" message={`Are you sure you want to delete "${deleteContact?.name}"?`} />
    </div>
  )
}
