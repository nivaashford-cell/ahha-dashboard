import { useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'

const relationshipTypes = [
  'Client', 'Caregiver', 'Vendor', 'Partner', 'Staff', 'Referral Source', 'Insurance', 'Other'
]

export default function ContactForm({ contact, onSubmit, onCancel, loading }) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    role: '',
    relationship_type: '',
    notes: '',
    last_contact_date: '',
  })

  useEffect(() => {
    if (contact) {
      setForm({
        name: contact.name || '',
        email: contact.email || '',
        phone: contact.phone || '',
        company: contact.company || '',
        role: contact.role || '',
        relationship_type: contact.relationship_type || '',
        notes: contact.notes || '',
        last_contact_date: contact.last_contact_date || '',
      })
    }
  }, [contact])

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(form)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2 sm:col-span-1">
          <label className="label">Full Name *</label>
          <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" placeholder="Full name" required />
        </div>
        <div className="col-span-2 sm:col-span-1">
          <label className="label">Email</label>
          <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input" placeholder="email@example.com" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Phone</label>
          <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input" placeholder="(555) 123-4567" />
        </div>
        <div>
          <label className="label">Company</label>
          <input type="text" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} className="input" placeholder="Organization" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Role</label>
          <input type="text" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="input" placeholder="Job title / role" />
        </div>
        <div>
          <label className="label">Relationship Type</label>
          <select value={form.relationship_type} onChange={(e) => setForm({ ...form, relationship_type: e.target.value })} className="input">
            <option value="">Select type...</option>
            {relationshipTypes.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="label">Last Contact Date</label>
        <input type="date" value={form.last_contact_date} onChange={(e) => setForm({ ...form, last_contact_date: e.target.value })} className="input" />
      </div>

      <div>
        <label className="label">Notes</label>
        <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="input min-h-[80px] resize-y" placeholder="Additional notes..." rows={3} />
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel} className="btn btn-secondary">Cancel</button>
        <button type="submit" disabled={loading} className="btn btn-primary">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (contact ? 'Update Contact' : 'Add Contact')}
        </button>
      </div>
    </form>
  )
}
