import { Globe2, Image, Pencil } from 'lucide-react'

const homeActions = [
  {
    icon: Image,
    label: 'Create notes',
    prompt:
      'Use the smart notes generator to create clean study notes about this topic: ',
  },
  {
    icon: Pencil,
    label: 'Write or edit',
    prompt: 'Help me write or improve this content: ',
  },
  {
    icon: Globe2,
    label: 'Look something up',
    prompt:
      'Use the best OrbitAi learning tool to explain this clearly and give key points: ',
  },
]

type HomeActionPillsProps = {
  onSelectPrompt: (prompt: string) => void
}

export function HomeActionPills({ onSelectPrompt }: HomeActionPillsProps) {
  return (
    <div className="home-action-row" aria-label="Quick actions">
      {homeActions.map(({ icon: Icon, label, prompt }) => (
        <button type="button" key={label} onClick={() => onSelectPrompt(prompt)}>
          <Icon size={23} strokeWidth={1.9} />
          {label}
        </button>
      ))}
    </div>
  )
}
