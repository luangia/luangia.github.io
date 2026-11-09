import { resume, site, type ResumeEntry } from '../../content'

function Entries({ title, entries }: { title: string; entries: ResumeEntry[] }) {
  return (
    <section className="subsection">
      <h3>{title}</h3>
      <ul className="card-list">
        {entries.map((entry) => (
          <li className="card" key={`${entry.title}-${entry.organization}`}>
            <h4>{entry.title}</h4>
            <p className="byline">
              {entry.organization} · {entry.dates}
            </p>
            {entry.detail && <p>{entry.detail}</p>}
          </li>
        ))}
      </ul>
    </section>
  )
}

export function ResumeSection() {
  return (
    <>
      {resume.pdf && (
        <div className="card-links">
          <a download href={resume.pdf}>
            {site.ui.downloadResume}
          </a>
        </div>
      )}
      <p>{resume.summary}</p>
      <Entries entries={resume.experience} title={site.ui.experience} />
      <Entries entries={resume.education} title={site.ui.education} />
    </>
  )
}
