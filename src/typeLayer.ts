import { passages } from './content'

/**
 * Whether the room (window, sky and window frame) is set in type. Off, only
 * the desk objects carry passages, and the room's blue prints as plain dots.
 * The room's passages stay in content/passages.json either way.
 */
export const ROOM_TYPE = false

/** The passages actually printed in the scene, which the colophon credits. */
export const printedPassages = passages.filter((passage) => ROOM_TYPE || passage.object !== 'room')
