export type Attachment = {
  name: string
  type: string
  text?: string
  data?: string
}

export type ChatMessage = {
  id: string
  role: 'user' | 'model'
  text: string
  attachments?: Attachment[]
}

export type ToolPrompt = {
  label: string
  prompt: string
}
