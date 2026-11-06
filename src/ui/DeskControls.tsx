import { useEffect, useRef } from 'react'
import { site } from '../content'
import { useDeskStore } from '../state/store'

/**
 * The real keyboard and screen-reader controls for the 3D objects. They are
 * visually hidden; the focused object shows its ring in the scene instead.
 */
export function DeskControls() {
  const focused = useDeskStore((state) => state.focused)
  const focus = useDeskStore((state) => state.focus)
  const setKeyboardTarget = useDeskStore((state) => state.setKeyboardTarget)
  const button = useRef<HTMLButtonElement>(null)
  const wasOpen = useRef(false)
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

  useEffect(() => {
    if (wasOpen.current && focused === null) button.current?.focus({ preventScroll: true })
    wasOpen.current = focused !== null
  }, [focused])

  const handleFocus = () => {
    if (usingKeyboard.current) setKeyboardTarget('laptop')
  }

  return (
    <button
      className="visually-hidden"
      inert={focused !== null}
      ref={button}
      type="button"
      onBlur={() => setKeyboardTarget(null)}
      onClick={() => focus('laptop')}
      onFocus={handleFocus}
    >
      {site.objects.laptop.openLabel}
    </button>
  )
}
