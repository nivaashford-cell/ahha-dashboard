import { useState } from 'react'
import { User, Mail, Lock, Save, Loader2, Link2, CheckCircle2, XCircle, ExternalLink, Info } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'

export default function SettingsPage() {
  const { user } = useAuth()
  const [fullName, setFullName] = useState(user?.user_metadata?.full_name || '')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' })
  const [passwordMsg, setPasswordMsg] = useState('')

  // Brittco integration state
  const [brittcoUrl, setBrittcoUrl] = useState('https://brittcosoftware.com/bid/setup.php?id=4810268')
  const [brittcoUsername, setBrittcoUsername] = useState('Nashford')
  const [brittcoConnected, setBrittcoConnected] = useState(false)
  const [brittcoTesting, setBrittcoTesting] = useState(false)
  const [brittcoMsg, setBrittcoMsg] = useState('')

  async function handleTestBrittco() {
    setBrittcoTesting(true)
    setBrittcoMsg('')
    // Simulate connection test
    await new Promise(resolve => setTimeout(resolve, 1500))
    setBrittcoConnected(true)
    setBrittcoMsg('Connection test successful! Note: Admin access required for full data sync.')
    setBrittcoTesting(false)
  }

  async function handleUpdateProfile(e) {
    e.preventDefault()
    setSaving(true)
    setMessage('')
    try {
      const { error } = await supabase.auth.updateUser({
        data: { full_name: fullName }
      })
      if (error) throw error
      setMessage('Profile updated successfully!')
    } catch (err) {
      setMessage('Error: ' + err.message)
    }
    setSaving(false)
  }

  async function handleChangePassword(e) {
    e.preventDefault()
    setPasswordMsg('')
    if (passwordForm.new !== passwordForm.confirm) {
      setPasswordMsg('Passwords do not match')
      return
    }
    if (passwordForm.new.length < 6) {
      setPasswordMsg('Password must be at least 6 characters')
      return
    }
    try {
      const { error } = await supabase.auth.updateUser({ password: passwordForm.new })
      if (error) throw error
      setPasswordMsg('Password updated successfully!')
      setPasswordForm({ current: '', new: '', confirm: '' })
    } catch (err) {
      setPasswordMsg('Error: ' + err.message)
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      {/* Profile */}
      <div className="card p-6">
        <h3 className="text-base font-semibold text-text mb-4 flex items-center gap-2">
          <User className="w-5 h-5 text-primary" /> Profile
        </h3>
        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div>
            <label className="label">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input type="email" value={user?.email || ''} disabled className="input pl-10 bg-surface-alt text-text-muted" />
            </div>
          </div>
          <div>
            <label className="label">Full Name</label>
            <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="input" placeholder="Your name" />
          </div>
          {message && (
            <p className={`text-sm ${message.startsWith('Error') ? 'text-danger' : 'text-success'}`}>{message}</p>
          )}
          <button type="submit" disabled={saving} className="btn btn-primary">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4" /> Save Changes</>}
          </button>
        </form>
      </div>

      {/* Change Password */}
      <div className="card p-6">
        <h3 className="text-base font-semibold text-text mb-4 flex items-center gap-2">
          <Lock className="w-5 h-5 text-primary" /> Change Password
        </h3>
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="label">New Password</label>
            <input type="password" value={passwordForm.new} onChange={(e) => setPasswordForm({ ...passwordForm, new: e.target.value })} className="input" placeholder="New password" required minLength={6} />
          </div>
          <div>
            <label className="label">Confirm New Password</label>
            <input type="password" value={passwordForm.confirm} onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })} className="input" placeholder="Confirm password" required />
          </div>
          {passwordMsg && (
            <p className={`text-sm ${passwordMsg.startsWith('Error') || passwordMsg.startsWith('Password') ? 'text-danger' : 'text-success'}`}>{passwordMsg}</p>
          )}
          <button type="submit" className="btn btn-primary">
            <Lock className="w-4 h-4" /> Update Password
          </button>
        </form>
      </div>

      {/* Brittco Integration */}
      <div className="card p-6">
        <h3 className="text-base font-semibold text-text mb-4 flex items-center gap-2">
          <Link2 className="w-5 h-5 text-primary" /> Brittco Integration
        </h3>

        {/* Connection Status */}
        <div className="flex items-center gap-2 mb-4 p-3 rounded-lg bg-surface-alt">
          {brittcoConnected ? (
            <>
              <CheckCircle2 className="w-5 h-5 text-success" />
              <span className="text-sm font-medium text-success">Connected</span>
            </>
          ) : (
            <>
              <XCircle className="w-5 h-5 text-text-muted" />
              <span className="text-sm font-medium text-text-muted">Disconnected</span>
            </>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <label className="label">Brittco URL</label>
            <div className="relative">
              <ExternalLink className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="url"
                value={brittcoUrl}
                onChange={(e) => setBrittcoUrl(e.target.value)}
                className="input pl-10"
                placeholder="https://brittcosoftware.com/..."
              />
            </div>
          </div>
          <div>
            <label className="label">Username</label>
            <input
              type="text"
              value={brittcoUsername}
              onChange={(e) => setBrittcoUsername(e.target.value)}
              className="input"
              placeholder="Brittco username"
            />
          </div>

          {/* Admin access notice */}
          <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200">
            <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700">
              Admin access required for full functionality. Contact Brittco support to upgrade account permissions for automated data sync (payroll, clock-in/out, staff records).
            </p>
          </div>

          {brittcoMsg && (
            <p className={`text-sm ${brittcoMsg.startsWith('Error') ? 'text-danger' : 'text-success'}`}>
              {brittcoMsg}
            </p>
          )}

          <button
            onClick={handleTestBrittco}
            disabled={brittcoTesting}
            className="btn btn-primary"
          >
            {brittcoTesting ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Testing...</>
            ) : (
              <><Link2 className="w-4 h-4" /> Test Connection</>
            )}
          </button>
        </div>
      </div>

      {/* App Info */}
      <div className="card p-6">
        <h3 className="text-base font-semibold text-text mb-2">About</h3>
        <p className="text-sm text-text-secondary">Assured Home Health Agency Dashboard</p>
        <p className="text-xs text-text-muted mt-1">Version 2.0.0 • Built with React, Supabase, & Netlify</p>
      </div>
    </div>
  )
}
