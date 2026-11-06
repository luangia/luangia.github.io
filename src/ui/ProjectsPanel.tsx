import { useEffect } from 'react'
import { projects, site } from '../content'
import { useDeskStore } from '../state/store'

export function ProjectsPanel() {
  const open = useDeskStore((state) => state.focused === 'laptop')
  const returnToDesk = useDeskStore((state) => state.returnToDesk)

  useEffect(() => {
    if (!open) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') returnToDesk()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, returnToDesk])

  return (
    <aside
      aria-labelledby="projects-title"
      className="panel"
      data-open={open}
      inert={!open}
      role="dialog"
    >
      <header className="panel-header">
        <h2 id="projects-title">{site.objects.laptop.panelTitle}</h2>
        <button className="panel-back" type="button" onClick={returnToDesk}>
          {site.ui.back}
        </button>
      </header>

      <ul className="project-list">
        {projects.map((project) => (
          <li className="project-card" key={project.title}>
            <h3>{project.title}</h3>
            <p>{project.summary}</p>
            <dl>
              <dt>{site.ui.role}</dt>
              <dd>{project.role}</dd>
              <dt>{site.ui.stack}</dt>
              <dd>{project.stack.join(', ')}</dd>
            </dl>
            <div className="project-links">
              {project.links.live && (
                <a href={project.links.live} rel="noreferrer" target="_blank">
                  {site.ui.live}
                </a>
              )}
              {project.links.github && (
                <a href={project.links.github} rel="noreferrer" target="_blank">
                  {site.ui.github}
                </a>
              )}
            </div>
          </li>
        ))}
      </ul>
    </aside>
  )
}
