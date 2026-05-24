import {
  Download,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Trash2,
} from 'lucide-react'
import { quickActions } from '../appData'
import { OrbitAiMark } from './OrbitAiMark'

const chatHistory = [
  'HTML website creation',
  'OpenAI Revenue Sources',
  'Odd One Out Analysis',
  'Salesforce DX Setup Steps',
  'Chocolate Animation Demo',
  'AI Apocalypse Debate',
  'Python Project Guidance',
  'Navigating Windows CMD',
  'Change directory in CMD',
  'Bluetooth Audio Issue',
  'Video Summarization Request',
  'Technical Event Ideas',
  "Simple Mother's Day Wishes",
]

type ToolSidebarProps = {
  hasMessages: boolean
  isOpen: boolean
  onClear: () => void
  onExport: () => void
  onNewChat: () => void
  onSelectPrompt: (prompt: string) => void
  onToggle: () => void
}

export function ToolSidebar({
  hasMessages,
  isOpen,
  onClear,
  onExport,
  onNewChat,
  onSelectPrompt,
  onToggle,
}: ToolSidebarProps) {
  return (
    <aside
      className={isOpen ? 'app-sidebar' : 'app-sidebar collapsed'}
      aria-label="OrbitAi sidebar"
    >
      <div className="sidebar-top">
        <div className="brand-lockup">
          <OrbitAiMark />
          <span>OrbitAi</span>
        </div>
        <button
          className="sidebar-icon-button"
          type="button"
          aria-label={isOpen ? 'Close tools sidebar' : 'Open tools sidebar'}
          title={isOpen ? 'Close tools sidebar' : 'Open tools sidebar'}
          onClick={onToggle}
        >
          {isOpen ? (
            <PanelLeftClose size={18} strokeWidth={2} />
          ) : (
            <PanelLeftOpen size={18} strokeWidth={2} />
          )}
        </button>
      </div>

      <div className="sidebar-content">
        <button
          className="new-chat-row"
          type="button"
          aria-label="New chat"
          title="New chat"
          onClick={onNewChat}
        >
          <Plus size={18} strokeWidth={2} />
          New
        </button>

        <nav className="chat-history" aria-label="Recent chats">
          {chatHistory.map((item) => (
            <button type="button" key={item} onClick={() => onSelectPrompt(item)}>
              {item}
            </button>
          ))}
        </nav>

        <div className="sidebar-actions" aria-label="Chat actions">
          <button type="button" onClick={onExport} disabled={!hasMessages}>
            <Download size={16} strokeWidth={1.9} />
            Export
          </button>
          <button type="button" onClick={onClear} disabled={!hasMessages}>
            <Trash2 size={16} strokeWidth={1.9} />
            Clear
          </button>
        </div>

        <div className="agent-tools">
          <p>Agent tools</p>
          {quickActions.map(({ icon: Icon, label, prompt }) => (
            <button
              type="button"
              className="agent-tool"
              key={label}
              onClick={() => onSelectPrompt(prompt)}
            >
              <span className="agent-tool-icon">
                <Icon size={18} strokeWidth={1.8} />
              </span>
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>
    </aside>
  )
}
