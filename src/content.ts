import aboutJson from '../content/about.json'
import booksJson from '../content/books.json'
import contactJson from '../content/contact.json'
import languagesJson from '../content/languages.json'
import passagesJson from '../content/passages.json'
import projectsJson from '../content/projects.json'
import resumeJson from '../content/resume.json'
import siteJson from '../content/site.json'
import writingJson from '../content/writing.json'

export type Project = {
  title: string
  summary: string
  role: string
  stack: string[]
  links: { github: string | null; live: string | null }
  images: string[]
  featured: boolean
}

export type BookStatus = 'reading' | 'read' | 'want'

export type Book = {
  title: string
  author: string
  status: BookStatus
  rating: number | null
  note: string | null
  quote: string | null
}

export type WritingSample = {
  title: string
  summary: string
  link: string | null
}

export type WordOfTheDay = {
  word: string
  meaning: string
}

export type Language = {
  name: string
  level: string
  started: string | null
  focus: string | null
  wordOfTheDay: WordOfTheDay[]
}

export type ResumeEntry = {
  title: string
  organization: string
  dates: string
  detail: string | null
}

export const about: {
  name: string
  bio: string
  avatar: string | null
  values: string[]
  funFacts: string[]
} = aboutJson

export const books = booksJson as Book[]
export const writing: WritingSample[] = writingJson
export const projects: Project[] = projectsJson

export const languages: { streakDays: number | null; languages: Language[] } = languagesJson

export const resume: {
  pdf: string | null
  summary: string
  experience: ResumeEntry[]
  education: ResumeEntry[]
} = resumeJson

export const contact: {
  message: string
  email: string | null
  linkedin: string | null
  github: string | null
} = contactJson

export type Passage = {
  /** Which part of the print is set in it: 'room' or a section's object. */
  object: 'room' | 'about' | 'projects' | 'reading' | 'languages' | 'resume' | 'contact'
  title: string
  author: string
  year: number
  source: string
  text: string
}

/** Public-domain passages that the print's blue layer is typeset in. */
export const passages = passagesJson as Passage[]

export const site = siteJson
