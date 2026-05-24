import {
  Archive,
  BookOpen,
  BriefcaseBusiness,
  ClipboardList,
  Code2,
  Edit3,
  FileText,
  GraduationCap,
  Lightbulb,
  ListChecks,
  Menu,
  MessageCircle,
  Plus,
  Search,
  TimerReset,
  Tv,
  Workflow,
} from 'lucide-react'

export const railItems = [
  { icon: Menu, label: 'Menu' },
  { icon: Plus, label: 'New chat', action: 'new-chat' },
  { icon: Search, label: 'Search' },
  { icon: MessageCircle, label: 'Chats' },
  { icon: Archive, label: 'Library' },
  { icon: Workflow, label: 'Projects' },
  { icon: Code2, label: 'Code' },
  { icon: BriefcaseBusiness, label: 'Work' },
] as const

export const quickActions = [
  {
    icon: Edit3,
    label: 'Notes',
    prompt:
      'Use the smart notes generator to create structured notes about this topic: ',
  },
  {
    icon: FileText,
    label: 'PDF Summary',
    prompt:
      'Use the PDF/document summarizer. Summarize my attached document with key points, questions, and topic breakdown.',
  },
  {
    icon: ClipboardList,
    label: 'Assignment',
    prompt:
      'Use the assignment assistant to plan this assignment with checkpoints and research suggestions: ',
  },
  {
    icon: GraduationCap,
    label: 'Study Plan',
    prompt:
      'Use the AI study planner to create a priority-based study timetable for: ',
  },
  {
    icon: ListChecks,
    label: 'Tasks',
    prompt:
      'Use the task productivity dashboard to organize these tasks and track progress: ',
  },
  {
    icon: TimerReset,
    label: 'Pomodoro',
    prompt:
      'Use the Pomodoro focus timer to plan focus sessions for this task: ',
  },
  {
    icon: BookOpen,
    label: 'Quiz',
    prompt:
      'Use the quiz and flashcard generator to create MCQs and flashcards from this material: ',
  },
  {
    icon: Tv,
    label: 'YouTube',
    prompt:
      'Use the YouTube learning assistant to summarize this transcript or learning URL: ',
  },
  {
    icon: Code2,
    label: 'Coding',
    prompt: 'Use the coding assistant to help with this programming task: ',
  },
  {
    icon: Lightbulb,
    label: 'OrbitAi',
    prompt:
      'Choose the best OrbitAi tool for this request and give me a practical next step: ',
  },
] as const
