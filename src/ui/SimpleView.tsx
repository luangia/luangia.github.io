import { useEffect, type MouseEvent } from 'react'
import { site } from '../content'
import { SECTIONS, useDeskStore, type SectionId } from '../state/store'
import { Colophon } from './Colophon'
import { SECTION_VIEWS } from './sections'

/** All content as plain HTML, for screen readers, slow devices and no WebGL. */
export function SimpleView({ canShowDesk }: { canShowDesk: boolean }) {
  const focused = useDeskStore((state) => state.focused)

  // Without a desk to open, section links land on the section here instead.
  useEffect(() => {
    if (focused) document.getElementById(focused)?.scrollIntoView()
  }, [focused])

  const jumpTo = (event: MouseEvent, id: SectionId) => {
    event.preventDefault()
    document.getElementById(id)?.scrollIntoView()
  }

  return (
    <main className="simple">
      <header className="simple-header">
        <h1>{site.title}</h1>
        {canShowDesk && <a href="#">{site.ui.fullView}</a>}
        <nav aria-label={site.ui.navLabel}>
          <ul>
            {SECTIONS.map((id) => (
              <li key={id}>
                <a href={`#${id}`} onClick={(event) => jumpTo(event, id)}>
                  {site.sections[id].label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      {SECTIONS.map((id) => {
        const Section = SECTION_VIEWS[id]

        return (
          <section className="simple-section" id={id} key={id}>
            <h2>{site.sections[id].title}</h2>
            <Section />
          </section>
        )
      })}

      <footer className="simple-footer">
        <Colophon />
      </footer>
    </main>
  )
}
