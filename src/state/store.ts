import { create } from 'zustand'

export type DeskObjectId = 'laptop'

type DeskState = {
  /** The object the camera is closed up on, or null at the desk view. */
  focused: DeskObjectId | null
  /** The object the keyboard is on, which shows a focus ring in the scene. */
  keyboardTarget: DeskObjectId | null
  focus: (id: DeskObjectId) => void
  returnToDesk: () => void
  setKeyboardTarget: (id: DeskObjectId | null) => void
}

export const useDeskStore = create<DeskState>((set) => ({
  focused: null,
  keyboardTarget: null,
  focus: (id) => set({ focused: id }),
  returnToDesk: () => set({ focused: null }),
  setKeyboardTarget: (id) => set({ keyboardTarget: id }),
}))
