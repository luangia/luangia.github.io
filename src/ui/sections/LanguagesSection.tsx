import { languages, site, type Language } from '../../content'

const DAY_MS = 86_400_000

/** Picks a stable word per day, across every language that has any. */
function getWordOfTheDay(all: Language[]) {
  const words = all.flatMap((language) =>
    language.wordOfTheDay.map((entry) => ({ ...entry, language: language.name })),
  )

  if (words.length === 0) return null
  return words[Math.floor(Date.now() / DAY_MS) % words.length]
}

export function LanguagesSection() {
  const word = getWordOfTheDay(languages.languages)

  return (
    <>
      {languages.streakDays !== null && (
        <p>
          {site.ui.streak}: {languages.streakDays} {site.ui.days}
        </p>
      )}

      <ul className="card-list">
        {languages.languages.map((language) => (
          <li className="card" key={language.name}>
            <h3>{language.name}</h3>
            <dl>
              <dt>{site.ui.level}</dt>
              <dd>{language.level}</dd>
              {language.started && (
                <>
                  <dt>{site.ui.started}</dt>
                  <dd>{language.started}</dd>
                </>
              )}
              {language.focus && (
                <>
                  <dt>{site.ui.focus}</dt>
                  <dd>{language.focus}</dd>
                </>
              )}
            </dl>
          </li>
        ))}
      </ul>

      {word && (
        <section className="subsection">
          <h3>{site.ui.wordOfTheDay}</h3>
          <div className="card">
            <h4>{word.word}</h4>
            <p className="byline">{word.language}</p>
            <p>{word.meaning}</p>
          </div>
        </section>
      )}
    </>
  )
}
