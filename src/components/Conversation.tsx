import type { ChatMessage } from '../types'

type ConversationProps = {
  isSending: boolean
  messages: ChatMessage[]
}

export function Conversation({ isSending, messages }: ConversationProps) {
  if (messages.length === 0) {
    return null
  }

  return (
    <section className="conversation" aria-live="polite">
      {messages.map((message) => (
        <article className={`message ${message.role}`} key={message.id}>
          <span className="message-author">
            {message.role === 'user' ? 'You' : 'OrbitAi'}
          </span>
          <p>{message.text}</p>
          {message.attachments && message.attachments.length > 0 && (
            <div className="message-files">
              {message.attachments.map((attachment) => (
                <span key={attachment.name}>{attachment.name}</span>
              ))}
            </div>
          )}
        </article>
      ))}
      {isSending && (
        <article className="message model loading-message">
          <span className="message-author">OrbitAi</span>
          <p>Thinking with Gemini 2.5 Flash...</p>
        </article>
      )}
    </section>
  )
}
