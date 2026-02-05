import { Menu } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { getInitials } from '@/lib/helpers'
import NotificationBell from '@/components/ui/NotificationBell'

export default function Header({ onMenuClick, title }) {
  const { user } = useAuth()

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-lg border-b border-border">
      <div className="flex items-center justify-between h-16 px-4 lg:px-6">
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="p-2 rounded-lg hover:bg-surface-hover transition-colors lg:hidden"
          >
            <Menu className="w-5 h-5" />
          </button>
          <h2 className="text-lg font-semibold text-text">{title}</h2>
        </div>

        <div className="flex items-center gap-2">
          <NotificationBell />
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <span className="text-xs font-medium text-white">
              {getInitials(user?.user_metadata?.full_name || user?.email || 'U')}
            </span>
          </div>
        </div>
      </div>
    </header>
  )
}
