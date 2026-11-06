import { create } from 'zustand'

export type DeskObjectId = 'laptop'

type DeskState = {
  /** The object the camera is closed up on, or null at the desk view. */
  focused: DeskObjectId | null
  focus: (id: DeskObjectId) => void
  returnToDesk: () => void
}

export const useDeskStore = create<DeskState>((set) => ({
  focused: null,
  focus: (id) => set({ focused: id }),
  returnToDesk: () => set({ focused: null }),
}))
