import { create } from 'zustand'

/** Nav order. Each section has one object on the desk and one URL hash. */
export const SECTIONS = ['about', 'projects', 'reading', 'languages', 'resume', 'contact'] as const

export type SectionId = (typeof SECTIONS)[number]

const SIMPLE_HASH = 'simple'

function isSection(value: string): value is SectionId {
  return (SECTIONS as readonly string[]).includes(value)
}

/** The URL hash is the source of truth, so links, Back and deep links all agree. */
function readRoute() {
  const hash = window.location.hash.slice(1)

  return {
    focused: isSection(hash) ? hash : null,
    simple: hash === SIMPLE_HASH,
  }
}

type DeskState = ReturnType<typeof readRoute> & {
  /** The object the keyboard is on, which shows a focus ring in the scene. */
  keyboardTarget: SectionId | null
  focus: (id: SectionId) => void
  returnToDesk: () => void
  setKeyboardTarget: (id: SectionId | null) => void
}

export const useDeskStore = create<DeskState>((set) => ({
  ...readRoute(),
  keyboardTarget: null,
  focus: (id) => {
    window.location.hash = id
  },
  returnToDesk: () => {
    window.history.pushState(null, '', window.location.pathname + window.location.search)
    set(readRoute())
  },
  setKeyboardTarget: (id) => set({ keyboardTarget: id }),
}))

window.addEventListener('hashchange', () => useDeskStore.setState(readRoute()))
