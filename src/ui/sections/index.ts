import type { ComponentType } from 'react'
import type { SectionId } from '../../state/store'
import { AboutSection } from './AboutSection'
import { ContactSection } from './ContactSection'
import { LanguagesSection } from './LanguagesSection'
import { ProjectsSection } from './ProjectsSection'
import { ReadingSection } from './ReadingSection'
import { ResumeSection } from './ResumeSection'

/** Section bodies are shared by the desk panel and the simple view. */
export const SECTION_VIEWS: Record<SectionId, ComponentType> = {
  about: AboutSection,
  projects: ProjectsSection,
  reading: ReadingSection,
  languages: LanguagesSection,
  resume: ResumeSection,
  contact: ContactSection,
}
