import projectsJson from '../content/projects.json'
import siteJson from '../content/site.json'

export type Project = {
  title: string
  summary: string
  role: string
  stack: string[]
  links: { github: string | null; live: string | null }
  images: string[]
  featured: boolean
}

export const projects: Project[] = projectsJson
export const site = siteJson
