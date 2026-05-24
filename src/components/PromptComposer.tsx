import { AudioLines, FileText, Mic, Plus, SendHorizontal, X } from 'lucide-react'
import type { FormEvent } from 'react'
import type { Attachment } from '../types'

type PromptComposerProps = {
  attachments: Attachment[]
  hasMessages: boolean
  isSending: boolean
  prompt: string
  onAttachFiles: (files: FileList | null) => void
  onClearAttachments: () => void
  onPromptChange: (prompt: string) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
}

export function PromptComposer({
  attachments,
  hasMessages,
  isSending,
  prompt,
  onAttachFiles,
  onClearAttachments,
  onPromptChange,
  onSubmit,
}: PromptComposerProps) {
  return (
    <>
      <form className="prompt-card" onSubmit={onSubmit}>
        <label className="sr-only" htmlFor="prompt">
          {hasMessages ? 'Message OrbitAi' : 'How can I help you today?'}
        </label>
        <label className="icon-button file-button" aria-label="Attach file">
          <Plus size={28} strokeWidth={1.65} />
          <input
            type="file"
            accept=".pdf,.txt,.md,.csv,.json,.js,.ts,.tsx,.jsx,.py,.java,.cpp,.c,.html,.css"
            multiple
            onChange={(event) => onAttachFiles(event.target.files)}
          />
        </label>
        <textarea
          id="prompt"
          rows={1}
          aria-label="Chat prompt"
          placeholder="Ask anything"
          value={prompt}
          onChange={(event) => onPromptChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault()
              event.currentTarget.form?.requestSubmit()
            }
          }}
        />
        <button
          className="icon-button"
          type="button"
          aria-label="Voice input"
          title="Voice input"
        >
          <Mic size={23} strokeWidth={1.65} />
        </button>
        <button
          className="send-button"
          type="submit"
          aria-label="Send message"
          disabled={isSending || !prompt.trim()}
          title="Send"
        >
          {prompt.trim() ? (
            <SendHorizontal size={20} strokeWidth={2} />
          ) : (
            <AudioLines size={24} strokeWidth={2.25} />
          )}
        </button>
      </form>

      {attachments.length > 0 && (
        <div className="attachment-row" aria-label="Attached files">
          {attachments.map((attachment) => (
            <span className="attachment-pill" key={attachment.name}>
              <FileText size={16} strokeWidth={1.8} />
              {attachment.name}
            </span>
          ))}
          <button
            className="attachment-clear"
            type="button"
            aria-label="Clear attachments"
            onClick={onClearAttachments}
          >
            <X size={16} strokeWidth={2} />
          </button>
        </div>
      )}
    </>
  )
}
