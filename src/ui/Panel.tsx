import { useEffect, useRef } from 'react'
import { site } from '../content'
import { useDeskStore, type SectionId } from '../state/store'
import { SECTION_VIEWS } from './sections'

export function Panel() {
  const focused = useDeskStore((state) => state.focused)
  const returnToDesk = useDeskStore((state) => state.returnToDesk)
  const back = useRef<HTMLButtonElement>(null)
  const panel = useRef<HTMLElement>(null)
  // Keeps the content in place while the panel fades out.
  const shown = useRef<SectionId>('projects')
  const open = focused !== null

  if (focused) shown.current = focused

  useEffect(() => {
    if (!focused) return

    panel.current?.scrollTo({ top: 0 })
    back.current?.focus({ preventScroll: true })
  }, [focused])

  useEffect(() => {
    if (!open) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') returnToDesk()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, returnToDesk])

  const Section = SECTION_VIEWS[shown.current]

  return (
    <aside
      aria-labelledby="panel-title"
      className="panel"
      data-open={open}
      inert={!open}
      ref={panel}
      role="dialog"
    >
      <header className="panel-header">
        <h2 id="panel-title">{site.sections[shown.current].title}</h2>
        <button className="panel-back" ref={back} type="button" onClick={returnToDesk}>
          {site.ui.back}
        </button>
      </header>

      <Section />
    </aside>
  )
}
