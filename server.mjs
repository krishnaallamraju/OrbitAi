import 'dotenv/config'
import http from 'node:http'
import { ChatGoogleGenerativeAI } from '@langchain/google-genai'
import { createAgent, tool } from 'langchain'
import { PDFParse } from 'pdf-parse'
import { z } from 'zod'

const PORT = Number(process.env.PORT || 3001)
const MODEL = 'gemini-2.5-flash'
const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    'Content-Type': 'application/json',
  })
  response.end(JSON.stringify(payload))
}

function readBody(request) {
  return new Promise((resolve, reject) => {
    let body = ''

    request.on('data', (chunk) => {
      body += chunk

      if (body.length > 8_000_000) {
        reject(new Error('Request body is too large.'))
        request.destroy()
      }
    })

    request.on('end', () => resolve(body))
    request.on('error', reject)
  })
}

function section(title, items) {
  return [`## ${title}`, ...items.map((item) => `- ${item}`)].join('\n')
}

function splitLines(input) {
  return String(input || '')
    .split(/\n|\. /)
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 12)
}

function summarizeText(input, fallback) {
  const lines = splitLines(input)

  if (lines.length === 0) {
    return fallback
  }

  return lines.map((line) => line.replace(/\s+/g, ' ')).slice(0, 7)
}

async function extractPdfText(attachment) {
  const base64 = String(attachment.data || '').replace(
    /^data:application\/pdf;base64,/,
    '',
  )
  const parser = new PDFParse({ data: Buffer.from(base64, 'base64') })

  try {
    const result = await parser.getText()
    return result.text.trim()
  } finally {
    await parser.destroy()
  }
}

async function normalizeAttachments(attachments = []) {
  const normalized = []

  for (const attachment of attachments.slice(0, 3)) {
    if (attachment.type === 'application/pdf' && attachment.data) {
      const text = await extractPdfText(attachment)
      normalized.push({
        name: attachment.name,
        type: attachment.type,
        text: text.slice(0, 20_000),
      })
      continue
    }

    normalized.push({
      name: attachment.name,
      type: attachment.type,
      text: String(attachment.text || '').slice(0, 20_000),
    })
  }

  return normalized
}

function buildUserContent(message) {
  const attachments = Array.isArray(message.attachments)
    ? message.attachments
    : []

  if (attachments.length === 0) {
    return message.text
  }

  const files = attachments
    .map(
      (attachment) =>
        `File: ${attachment.name}\nType: ${attachment.type}\nContent:\n${attachment.text}`,
    )
    .join('\n\n---\n\n')

  return `${message.text}\n\nAttached documents:\n${files}`
}

function toLangChainMessages(messages) {
  return messages.map((message) => ({
    role: message.role === 'model' ? 'assistant' : 'user',
    content: buildUserContent(message),
  }))
}

function messageToText(content) {
  if (typeof content === 'string') {
    return content
  }

  if (Array.isArray(content)) {
    return content
      .map((part) => {
        if (typeof part === 'string') {
          return part
        }

        if (part && typeof part === 'object' && 'text' in part) {
          return String(part.text)
        }

        return ''
      })
      .filter(Boolean)
      .join('\n')
  }

  return String(content || '')
}

const smartNotesGenerator = tool(
  ({ sourceText, format = 'structured', audience = 'student' }) => {
    const bullets = summarizeText(sourceText, [
      'Define the topic and purpose.',
      'List the main ideas.',
      'Add examples or formulas where useful.',
      'End with revision checkpoints.',
    ])

    return [
      `Smart notes for: ${audience}`,
      `Format: ${format}`,
      section('Concise Notes', bullets),
      section('Revision Cues', [
        'Review the first and last bullet after 24 hours.',
        'Turn each key point into a flashcard.',
        'Mark unclear terms for follow-up research.',
      ]),
      'Export-ready: copy this response as Markdown.',
    ].join('\n\n')
  },
  {
    name: 'smart_notes_generator',
    description:
      'Generate concise notes, bullet summaries, structured notes, and export-ready Markdown from user prompts or long text.',
    schema: z.object({
      sourceText: z.string().describe('Prompt or long text to convert into notes.'),
      format: z
        .enum(['bullets', 'structured', 'outline', 'cornell'])
        .default('structured'),
      audience: z.string().default('student'),
    }),
  },
)

const pdfDocumentSummarizer = tool(
  ({ documentText, fileName = 'document' }) => {
    const keyPoints = summarizeText(documentText, [
      'Identify the main topic.',
      'Extract the core argument.',
      'Note important definitions.',
      'Highlight examples, dates, formulas, or claims.',
    ])

    return [
      `Document summary for ${fileName}`,
      section('Key Points', keyPoints),
      section('Topic Breakdown', [
        'Overview: what the document is mainly about.',
        'Core ideas: concepts that repeat or receive emphasis.',
        'Evidence: examples, data, references, or explanations.',
        'Takeaways: what to revise or use later.',
      ]),
      section('Important Questions', [
        'What is the central idea of this document?',
        'Which terms or processes must be memorized?',
        'What examples support the main idea?',
        'How would this topic appear in an exam or assignment?',
      ]),
    ].join('\n\n')
  },
  {
    name: 'pdf_document_summarizer',
    description:
      'Summarize uploaded PDFs/documents, extract key points, generate questions, and break topics down.',
    schema: z.object({
      documentText: z.string().describe('Extracted text from the PDF or document.'),
      fileName: z.string().optional(),
    }),
  },
)

const assignmentAssistant = tool(
  ({ assignment, deadline = 'not provided', currentProgress = 'not started' }) =>
    [
      `Assignment plan: ${assignment}`,
      section('Plan', [
        'Clarify the rubric, expected length, and submission format.',
        'Break the assignment into research, outline, draft, edit, and final review.',
        'Reserve time for citations, formatting, and plagiarism checks.',
      ]),
      section('Deadline Tracking', [
        `Deadline: ${deadline}`,
        `Current progress: ${currentProgress}`,
        'Set a checkpoint at 25%, 50%, 80%, and final submission.',
      ]),
      section('Research Suggestions', [
        'Find 3-5 credible sources.',
        'Capture quotes with citation details immediately.',
        'Compare at least two viewpoints before drafting.',
      ]),
    ].join('\n\n'),
  {
    name: 'assignment_assistant',
    description:
      'Plan assignments, track deadlines, suggest research, draft content sections, and create progress checkpoints.',
    schema: z.object({
      assignment: z.string(),
      deadline: z.string().optional(),
      currentProgress: z.string().optional(),
    }),
  },
)

const studyPlanner = tool(
  ({ subjects, goal, hoursPerDay = 2, examDate = 'not provided' }) =>
    [
      `Study plan for: ${goal}`,
      section('Daily Schedule', [
        `Study time: ${hoursPerDay} hour(s) per day`,
        `Subjects: ${subjects.join(', ')}`,
        'Start with the hardest subject while energy is highest.',
        'Use active recall for the final 20 minutes.',
      ]),
      section('Priority Routine', [
        'High priority: weak topics and upcoming deadlines.',
        'Medium priority: practice questions and summaries.',
        'Low priority: rereading and cosmetic note cleanup.',
      ]),
      section('Exam Prep', [
        `Exam date: ${examDate}`,
        'Finish first revision pass before the final 30% of available days.',
        'Use mock tests and error logs during the final stretch.',
      ]),
    ].join('\n\n'),
  {
    name: 'ai_study_planner',
    description:
      'Create daily schedules, exam prep plans, smart timetables, personalized routines, and priority-based study plans.',
    schema: z.object({
      subjects: z.array(z.string()).default(['main subject']),
      goal: z.string(),
      hoursPerDay: z.number().default(2),
      examDate: z.string().optional(),
    }),
  },
)

const productivityDashboard = tool(
  ({ tasks, goal = 'improve productivity' }) => {
    const taskRows = tasks.map(
      (task, index) => `${index + 1}. [todo] ${task}`,
    )

    return [
      `Productivity dashboard for: ${goal}`,
      ['## To-do List', ...taskRows].join('\n'),
      section('Status System', [
        'todo: not started',
        'doing: currently active',
        'blocked: needs help or resources',
        'done: complete and reviewed',
      ]),
      section('Weekly Insights', [
        'Track completed tasks / planned tasks.',
        'Notice which task type gets delayed most.',
        'Move unfinished high-priority tasks to the next day first.',
      ]),
    ].join('\n\n')
  },
  {
    name: 'task_productivity_dashboard',
    description:
      'Create to-do lists, status boards, progress analytics, goal tracking, productivity insights, and weekly dashboards.',
    schema: z.object({
      tasks: z.array(z.string()).default(['Define top priority task']),
      goal: z.string().optional(),
    }),
  },
)

const pomodoroTimer = tool(
  ({ focusMinutes = 25, breakMinutes = 5, sessions = 4, task = 'focused work' }) =>
    [
      `Pomodoro plan for: ${task}`,
      section('Session Setup', [
        `${sessions} focus session(s)`,
        `${focusMinutes} minutes focus`,
        `${breakMinutes} minutes break`,
        'After every fourth session, take a longer 15-30 minute break.',
      ]),
      section('Analytics To Track', [
        'Sessions completed',
        'Distractions noticed',
        'Task progress after each session',
        'Streak days this week',
      ]),
    ].join('\n\n'),
  {
    name: 'pomodoro_focus_timer',
    description:
      'Plan focus sessions, break reminders, productivity streaks, and session analytics.',
    schema: z.object({
      focusMinutes: z.number().default(25),
      breakMinutes: z.number().default(5),
      sessions: z.number().default(4),
      task: z.string().optional(),
    }),
  },
)

const quizFlashcardGenerator = tool(
  ({ sourceText, count = 5, mode = 'mixed' }) => {
    const points = summarizeText(sourceText, [
      'Core concept',
      'Important definition',
      'Practical example',
      'Common mistake',
      'Revision checkpoint',
    ]).slice(0, count)

    return [
      `Quiz and flashcards (${mode})`,
      '## MCQs',
      ...points.map(
        (point, index) =>
          `${index + 1}. Which statement best explains "${point}"?\n   A. Correct core idea\n   B. Unrelated idea\n   C. Opposite idea\n   D. Minor detail\n   Answer: A`,
      ),
      '',
      '## Flashcards',
      ...points.map((point) => `Front: Explain ${point}\nBack: ${point}`),
    ].join('\n')
  },
  {
    name: 'quiz_flashcard_generator',
    description:
      'Generate quizzes, flashcards, revision mode prompts, MCQs, and self-assessment items from notes.',
    schema: z.object({
      sourceText: z.string(),
      count: z.number().default(5),
      mode: z.enum(['quiz', 'flashcards', 'mixed']).default('mixed'),
    }),
  },
)

const youtubeLearningAssistant = tool(
  ({ transcriptOrUrl, goal = 'learn the topic' }) =>
    [
      `YouTube learning assistant: ${goal}`,
      section('Learning Points', summarizeText(transcriptOrUrl, [
        'Paste a transcript for deeper summarization.',
        'Identify the main topic of the video.',
        'Extract definitions, steps, examples, and warnings.',
      ])),
      section('Revision Summary', [
        'Watch once for context.',
        'Pause at every major concept and write one sentence.',
        'Convert the final notes into flashcards.',
      ]),
      'If only a URL is provided, paste the transcript too for exact notes.',
    ].join('\n\n'),
  {
    name: 'youtube_learning_assistant',
    description:
      'Summarize YouTube videos from transcripts, extract learning points, generate notes, and create revision summaries.',
    schema: z.object({
      transcriptOrUrl: z.string(),
      goal: z.string().optional(),
    }),
  },
)

const codingAssistant = tool(
  ({ request, language = 'general', code = '' }) =>
    [
      `Coding assistant (${language})`,
      section('Understanding', [
        request,
        code ? 'Code was provided for analysis.' : 'No code snippet was provided.',
      ]),
      section('Debugging Checklist', [
        'Reproduce the issue with the smallest input.',
        'Check data types, async flow, imports, and edge cases.',
        'Add a targeted test before changing behavior.',
      ]),
      section('Roadmap Guidance', [
        'Learn syntax and tooling.',
        'Practice small problems.',
        'Build projects that force debugging.',
        'Review DSA patterns: arrays, hash maps, recursion, graphs, DP.',
      ]),
    ].join('\n\n'),
  {
    name: 'coding_assistant',
    description:
      'Explain code, debug issues, generate snippets, solve DSA problems, and guide programming roadmaps.',
    schema: z.object({
      request: z.string(),
      language: z.string().optional(),
      code: z.string().optional(),
    }),
  },
)

const tools = [
  smartNotesGenerator,
  pdfDocumentSummarizer,
  assignmentAssistant,
  studyPlanner,
  productivityDashboard,
  pomodoroTimer,
  quizFlashcardGenerator,
  youtubeLearningAssistant,
  codingAssistant,
]

const llm = apiKey
  ? new ChatGoogleGenerativeAI({
      apiKey,
      model: MODEL,
      temperature: 0.35,
    })
  : null

const agent = llm
  ? createAgent({
      model: llm,
      tools,
      systemPrompt:
        'You are OrbitAi, a student-focused AI agent. Use tools whenever a request matches notes, PDF/document summarization, assignments, study planning, productivity, Pomodoro, quizzes/flashcards, YouTube learning, or coding. Return practical, structured Markdown. Keep responses concise unless the user asks for depth.',
    })
  : null

const server = http.createServer(async (request, response) => {
  if (request.method === 'GET' && request.url === '/api/health') {
    sendJson(response, 200, {
      ok: true,
      model: MODEL,
      mode: 'langchain-agent',
      tools: tools.map((agentTool) => agentTool.name),
    })
    return
  }

  if (request.method !== 'POST' || request.url !== '/api/chat') {
    sendJson(response, 404, { error: 'Not found.' })
    return
  }

  if (!agent) {
    sendJson(response, 500, {
      error: 'Missing GEMINI_API_KEY. Add it to .env and restart npm.cmd run dev.',
    })
    return
  }

  try {
    const body = await readBody(request)
    const payload = JSON.parse(body)
    const messages = Array.isArray(payload.messages) ? payload.messages : []
    const normalizedMessages = []

    for (const message of messages) {
      normalizedMessages.push({
        ...message,
        attachments: await normalizeAttachments(message.attachments),
      })
    }

    const agentMessages = toLangChainMessages(normalizedMessages).filter(
      (message) => message.content.trim().length > 0,
    )

    if (agentMessages.length === 0) {
      sendJson(response, 400, { error: 'Message is required.' })
      return
    }

    const result = await agent.invoke({ messages: agentMessages })
    const finalMessage = result.messages.at(-1)
    const reply = messageToText(finalMessage?.content)

    sendJson(response, 200, {
      reply: reply || 'OrbitAi completed the task, but no text reply was returned.',
    })
  } catch (error) {
    console.error(error)
    sendJson(response, 500, {
      error: 'OrbitAi agent request failed. Check your key, uploaded file, quota, and network.',
    })
  }
})

server.listen(PORT, () => {
  console.log(`OrbitAi LangChain agent listening on http://127.0.0.1:${PORT}`)
})
