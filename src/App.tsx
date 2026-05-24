import { useState } from 'react'
import type { FormEvent } from 'react'
import './App.css'
import { Conversation } from './components/Conversation'
import { HomeActionPills } from './components/HomeActionPills'
import { OrbitAiMark } from './components/OrbitAiMark'
import { PromptComposer } from './components/PromptComposer'
import { ToolSidebar } from './components/ToolSidebar'
import { Topbar } from './components/Topbar'
import { filesToAttachments } from './fileUtils'
import type { Attachment, ChatMessage } from './types'

function App() {
  const [prompt, setPrompt] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [isSending, setIsSending] = useState(false)
  const [isToolSidebarOpen, setIsToolSidebarOpen] = useState(true)
  const [error, setError] = useState('')

  async function sendMessage(messageText: string) {
    const trimmed = messageText.trim()

    if (!trimmed || isSending) {
      return
    }

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      text: trimmed,
      attachments,
    }
    const nextMessages = [...messages, userMessage]

    setMessages(nextMessages)
    setPrompt('')
    setAttachments([])
    setError('')
    setIsSending(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages: nextMessages }),
      })

      const data = (await response.json()) as { reply?: string; error?: string }

      if (!response.ok || !data.reply) {
        throw new Error(data.error || 'OrbitAi could not reply right now.')
      }

      const reply = data.reply

      setMessages((currentMessages) => [
        ...currentMessages,
        {
          id: crypto.randomUUID(),
          role: 'model',
          text: reply,
        },
      ])
    } catch (caughtError) {
      const message =
        caughtError instanceof Error
          ? caughtError.message
          : 'OrbitAi could not reply right now.'
      setError(message)
    } finally {
      setIsSending(false)
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    void sendMessage(prompt)
  }

  async function handleAttachFiles(files: FileList | null) {
    setAttachments(await filesToAttachments(files))
  }

  function handleNewChat() {
    setMessages([])
    setAttachments([])
    setPrompt('')
    setError('')
  }

  function handleExport() {
    if (messages.length === 0) {
      return
    }

    const transcript = messages
      .map((message) => {
        const author = message.role === 'user' ? 'You' : 'OrbitAi'
        const files =
          message.attachments && message.attachments.length > 0
            ? `\nFiles: ${message.attachments
                .map((attachment) => attachment.name)
                .join(', ')}`
            : ''

        return `## ${author}\n${message.text}${files}`
      })
      .join('\n\n')
    const blob = new Blob([transcript], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')

    anchor.href = url
    anchor.download = 'orbitai-chat.md'
    anchor.click()
    URL.revokeObjectURL(url)
  }

  return (
    <main
      className={
        isToolSidebarOpen ? 'app-shell' : 'app-shell sidebar-is-collapsed'
      }
    >
      <ToolSidebar
        hasMessages={messages.length > 0}
        isOpen={isToolSidebarOpen}
        onClear={handleNewChat}
        onExport={handleExport}
        onNewChat={handleNewChat}
        onSelectPrompt={setPrompt}
        onToggle={() => setIsToolSidebarOpen((isOpen) => !isOpen)}
      />

      <section className="chat-home" aria-label="OrbitAi chat home">
        <Topbar />

        <div className="center-stage">
          <h1 className={messages.length > 0 ? 'chat-heading compact' : 'chat-heading'}>
            {messages.length > 0 && <OrbitAiMark />}
            <span>{messages.length > 0 ? 'OrbitAi' : 'Where should we begin?'}</span>
          </h1>

          <Conversation isSending={isSending} messages={messages} />

          <PromptComposer
            attachments={attachments}
            hasMessages={messages.length > 0}
            isSending={isSending}
            prompt={prompt}
            onAttachFiles={(files) => void handleAttachFiles(files)}
            onClearAttachments={() => setAttachments([])}
            onPromptChange={setPrompt}
            onSubmit={handleSubmit}
          />

          {error && <p className="error-message">{error}</p>}

          {messages.length === 0 && <HomeActionPills onSelectPrompt={setPrompt} />}
        </div>
      </section>
    </main>
  )
}

export default App
