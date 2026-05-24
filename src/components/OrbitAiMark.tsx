import { Orbit, Sparkles } from 'lucide-react'

export function OrbitAiMark() {
  return (
    <span className="orbit-mark" aria-hidden="true">
      <Orbit size={34} strokeWidth={1.65} />
      <Sparkles size={16} strokeWidth={2.15} />
    </span>
  )
}
