import { ChevronDown, Sparkles } from 'lucide-react'

export function Topbar() {
  return (
    <header className="topbar">
      <button className="model-title" type="button">
        <span>OrbitAi</span>
        <ChevronDown size={21} strokeWidth={2} />
      </button>
      <button className="upgrade-button" type="button">
        <Sparkles size={21} strokeWidth={2.15} />
        Upgrade
      </button>
    </header>
  )
}
