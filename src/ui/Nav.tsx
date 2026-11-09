import { useEffect, useRef } from 'react'
import { site } from '../content'
import { SECTIONS, useDeskStore, type SectionId } from '../state/store'

/**
 * The always-visible section links, which are also the keyboard controls for
 * the 3D objects: focusing a link lights its object in the scene.
 */
export function Nav() {
  const focused = useDeskStore((state) => state.focused)
  const setKeyboardTarget = useDeskStore((state) => state.setKeyboardTarget)
  const links = useRef(new Map<SectionId, HTMLAnchorElement>())
  const lastOpen = useRef<SectionId | null>(null)
  const usingKeyboard = useRef(false)

  // Tracked by hand because :focus-visible stays true on focus handed back
  // after a mouse close, which would leave the ring lit.
  useEffect(() => {
    const handleKeyDown = () => {
      usingKeyboard.current = true
    }
    const handlePointerDown = () => {
      usingKeyboard.current = false
    }

    window.addEventListener('keydown', handleKeyDown, true)
    window.addEventListener('pointerdown', handlePointerDown, true)

    return () => {
      window.removeEventListener('keydown', handleKeyDown, true)
      window.removeEventListener('pointerdown', handlePointerDown, true)
    }
  }, [])

  // Closing a panel hands focus back to the link for that object.
  useEffect(() => {
    if (lastOpen.current && focused === null) {
      links.current.get(lastOpen.current)?.focus({ preventScroll: true })
    }
    lastOpen.current = focused
  }, [focused])

  return (
    <nav aria-label={site.ui.navLabel} className="nav">
      <ul>
        {SECTIONS.map((id) => (
          <li key={id}>
            <a
              aria-current={focused === id ? 'page' : undefined}
              aria-label={site.sections[id].openLabel}
              href={`#${id}`}
              ref={(link) => {
                if (link) links.current.set(id, link)
              }}
              onBlur={() => setKeyboardTarget(null)}
              onFocus={() => {
                if (usingKeyboard.current) setKeyboardTarget(id)
              }}
            >
              {site.sections[id].label}
            </a>
          </li>
        ))}
        <li className="nav-simple">
          <a href="#simple">{site.ui.simpleView}</a>
        </li>
      </ul>
    </nav>
  )
}
