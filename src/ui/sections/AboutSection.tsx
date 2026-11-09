import { about, site } from '../../content'

export function AboutSection() {
  return (
    <>
      {about.avatar && <img alt={about.name} className="avatar" src={about.avatar} />}
      <h3>{about.name}</h3>
      <p>{about.bio}</p>

      <section className="subsection">
        <h3>{site.ui.values}</h3>
        <ul>
          {about.values.map((value) => (
            <li key={value}>{value}</li>
          ))}
        </ul>
      </section>

      <section className="subsection">
        <h3>{site.ui.funFacts}</h3>
        <ul>
          {about.funFacts.map((fact) => (
            <li key={fact}>{fact}</li>
          ))}
        </ul>
      </section>
    </>
  )
}
