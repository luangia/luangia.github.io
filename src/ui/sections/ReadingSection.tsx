import { books, site, writing, type BookStatus } from '../../content'

const SHELVES: BookStatus[] = ['reading', 'read', 'want']

export function ReadingSection() {
  return (
    <>
      {SHELVES.map((shelf) => {
        const shelved = books.filter((book) => book.status === shelf)
        if (shelved.length === 0) return null

        return (
          <section className="subsection" key={shelf}>
            <h3>{site.ui.shelf[shelf]}</h3>
            <ul className="card-list">
              {shelved.map((book) => (
                <li className="card" key={`${book.title}-${book.author}`}>
                  <h4>{book.title}</h4>
                  <p className="byline">{book.author}</p>
                  {book.note && <p>{book.note}</p>}
                  {book.quote && <blockquote>{book.quote}</blockquote>}
                  {book.rating !== null && (
                    <dl>
                      <dt>{site.ui.rating}</dt>
                      <dd>{book.rating}</dd>
                    </dl>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )
      })}

      <section className="subsection">
        <h3>{site.ui.writing}</h3>
        <ul className="card-list">
          {writing.map((piece) => (
            <li className="card" key={piece.title}>
              <h4>{piece.title}</h4>
              <p>{piece.summary}</p>
              {piece.link && (
                <div className="card-links">
                  <a href={piece.link} rel="noreferrer" target="_blank">
                    {site.ui.read}
                  </a>
                </div>
              )}
            </li>
          ))}
        </ul>
      </section>
    </>
  )
}
