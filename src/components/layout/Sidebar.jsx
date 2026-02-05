import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  CheckSquare,
  Users,
  FileBarChart,
  Handshake,
  Settings,
  LogOut,
  Heart,
  X,
  DollarSign,
  Zap,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/tasks', icon: CheckSquare, label: 'Tasks' },
  { to: '/contacts', icon: Users, label: 'Contacts' },
  { to: '/payroll', icon: DollarSign, label: 'Payroll' },
  { to: '/reports', icon: FileBarChart, label: 'Reports' },
  { to: '/automations', icon: Zap, label: 'Automations' },
  { to: '/collaborations', icon: Handshake, label: 'Collaborations' },
]

export default function Sidebar({ isOpen, onClose }) {
  const { signOut, user } = useAuth()

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/30 z-40 lg:hidden" onClick={onClose} />
      )}

      <aside className={`fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-border flex flex-col transition-transform duration-300 lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center gap-3 p-5 border-b border-border">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
            <Heart className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-sm font-bold text-text truncate">Assured Home Health</h1>
            <p className="text-xs text-text-muted truncate">Agency Dashboard</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-surface-hover lg:hidden">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-text-secondary hover:bg-surface-hover hover:text-text'
                }`
              }
              end={to === '/'}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-border space-y-1">
          <NavLink
            to="/settings"
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive ? 'bg-primary/10 text-primary' : 'text-text-secondary hover:bg-surface-hover'
              }`
            }
          >
            <Settings className="w-5 h-5" />
            Settings
          </NavLink>
          <button
            onClick={signOut}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-text-secondary hover:bg-red-50 hover:text-danger transition-colors w-full"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
          {user && (
            <div className="px-3 py-2 text-xs text-text-muted truncate">
              {user.email}
            </div>
          )}
        </div>
      </aside>
    </>
  )
}
