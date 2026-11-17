import { projects, site } from '../../content'

export function ProjectsSection() {
  return (
    <ul className="card-list">
      {projects.map((project) => (
        <li className="card" key={project.title}>
          <h3>{project.title}</h3>
          <p>{project.summary}</p>
          <dl>
            {project.role && (
              <>
                <dt>{site.ui.role}</dt>
                <dd>{project.role}</dd>
              </>
            )}
            <dt>{site.ui.stack}</dt>
            <dd>{project.stack.join(', ')}</dd>
          </dl>
          <div className="card-links">
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
  )
}
