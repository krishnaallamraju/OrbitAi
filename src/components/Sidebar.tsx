import { Download, Trash2 } from 'lucide-react'
import { railItems } from '../appData'

type SidebarProps = {
  hasMessages: boolean
  onNewChat: () => void
  onExport: () => void
  onClear: () => void
}

export function Sidebar({
  hasMessages,
  onNewChat,
  onExport,
  onClear,
}: SidebarProps) {
  return (
    <aside className="sidebar" aria-label="OrbitAi navigation">
      <nav className="rail-nav">
        {railItems.map((item) => {
          const Icon = item.icon
          const action = 'action' in item ? item.action : undefined

          return (
          <button
            className={action === 'new-chat' ? 'rail-button active' : 'rail-button'}
            key={item.label}
            type="button"
            aria-label={item.label}
            title={item.label}
            onClick={action === 'new-chat' ? onNewChat : undefined}
          >
            <Icon size={20} strokeWidth={1.75} />
          </button>
          )
        })}
      </nav>

      <div className="rail-bottom">
        <button
          className="rail-button download-button"
          type="button"
          aria-label="Export chat"
          title="Export chat"
          disabled={!hasMessages}
          onClick={onExport}
        >
          <Download size={20} strokeWidth={1.75} />
          {hasMessages && <span className="status-dot" />}
        </button>
        <button
          className="rail-button"
          type="button"
          aria-label="Clear chat"
          title="Clear chat"
          disabled={!hasMessages}
          onClick={onClear}
        >
          <Trash2 size={19} strokeWidth={1.75} />
        </button>
        <button
          className="profile-button"
          type="button"
          aria-label="Krishna profile"
          title="Krishna profile"
        >
          KP
        </button>
      </div>
    </aside>
  )
}
