import { MathUtils, Vector3 } from 'three'
import type { SectionId } from '../state/store'

/**
 * Risograph inks and paper, as approximate screen colors. The print pass
 * separates the rendered scene into these three inks.
 */
export const RISO = {
  paper: '#f1e9d2',
  blue: '#0078bf',
  pink: '#ff48b0',
  yellow: '#ffe800',
} as const

/** Lowest share of light any ink lets through, per channel. Shared with the print pass. */
export const MIN_INK_TRANSMISSION = 0.04

/**
 * A scene color written as an ink recipe: how much of each ink, 0–1, overprints
 * the paper. The print pass separates colors back into inks, so colors made this
 * way come back out as clean ink instead of muddy three-ink mixes.
 */
function inkMix(blue: number, pink = 0, yellow = 0) {
  const channel = (hex: string, index: number) => parseInt(hex.slice(1 + index * 2, 3 + index * 2), 16) / 255
  const transmit = (hex: string, index: number, amount: number) =>
    Math.max(channel(hex, index), MIN_INK_TRANSMISSION) ** amount

  const rgb = [0, 1, 2].map(
    (index) =>
      channel(RISO.paper, index) *
      transmit(RISO.blue, index, blue) *
      transmit(RISO.pink, index, pink) *
      transmit(RISO.yellow, index, yellow),
  )

  return `#${rgb.map((value) => Math.round(value * 255).toString(16).padStart(2, '0')).join('')}`
}

/** Scene colors, as ink recipes: inkMix(blue, pink, yellow). */
export const PALETTE = {
  ink: inkMix(1, 0.8, 0.5),
  indigo: inkMix(0.85, 0.35),
  violet: inkMix(0.55, 0.45),
  moss: inkMix(0.4, 0, 0.55),
  silver: inkMix(0.12),
  paleGold: inkMix(0, 0.05, 0.35),
  ember: inkMix(0, 0.75, 0.7),
  /** Bare paper: the wall prints nothing, so the objects stand alone. */
  wall: inkMix(0),
  wood: inkMix(0.15, 0.32, 0.28),
  /** Monstera leaves, deepest to lightest. */
  leafDeep: inkMix(0.82, 0.1, 0.8),
  leaf: inkMix(0.62, 0.04, 0.8),
  leafMid: inkMix(0.45, 0, 0.78),
  leafLight: inkMix(0.28, 0, 0.75),
  stem: inkMix(0.55, 0.05, 0.6),
  /** Terracotta pot, with a slightly deeper rim, and dark potting soil. */
  terracotta: inkMix(0.04, 0.5, 0.6),
  terracottaRim: inkMix(0.1, 0.58, 0.62),
  soil: inkMix(0.55, 0.45, 0.55),
  /**
   * The desk prints flat in this color: no blue of its own and no shading blue,
   * because its blue prints as dots, which read grey on wood.
   */
  deskWood: inkMix(0, 0.36, 0.3),
  ocean: inkMix(0.6, 0.1),
  land: inkMix(0.35, 0, 0.65),
  /** Laptop screen colors. */
  screen: inkMix(0.75, 0.3),
  gold: inkMix(0, 0.15, 0.85),
  verdigris: inkMix(0.5, 0, 0.75),
  /** Shade is added ink, so shadows deepen the blue instead of muddying every ink. */
  shade: inkMix(0.55, 0.12),
  skyDeep: inkMix(0.62, 0.1),
  skyGlow: inkMix(0.38),
  cloud: inkMix(0.1, 0.12),
  maria: inkMix(0.15, 0, 0.12),
}

/**
 * How each region's passage is set. `size` scales the letters (1 is a 9 CSS px
 * line); `weight` thickens strokes above 0 and thins them below, about ±0.1.
 */
export const TYPE_STYLE: Record<'room' | SectionId, { size: number; weight: number }> = {
  room: { size: 1, weight: 0 },
  about: { size: 0.85, weight: 0.06 },
  now: { size: 0.85, weight: 0.02 },
  projects: { size: 0.85, weight: 0 },
  reading: { size: 0.85, weight: -0.03 },
  languages: { size: 0.85, weight: 0.04 },
  resume: { size: 0.85, weight: -0.04 },
  contact: { size: 0.85, weight: 0 },
}

/** Outline color. The print pass spots it and prints a crisp key line. */
export const KEY_LINE = '#000000'

/**
 * Fixed first-person view: seated at the desk, facing it head-on. The eye sits
 * above the desk and back from its front edge, tilted slightly down, so the
 * near edge runs out of frame like the desk in front of you.
 */
export const CAMERA = {
  fov: 40,
  near: 0.1,
  far: 100,
  /** Rotation around the desk, in degrees from straight-on. */
  azimuth: 0,
  /** Degrees above the desk plane. */
  elevation: 10,
  distance: 7,
  target: new Vector3(0, 1.4, -1),
  parallax: {
    /** Maximum orbit at the screen edges, in degrees. */
    azimuth: 2,
    elevation: 1.2,
    /** Pointer drift during a close-up, in world units. */
    focusDrift: 0.04,
  },
  /** Damping time for all camera moves, in seconds; higher is lazier. */
  smoothTime: 0.25,
}

/** How far the seated camera pulls back so the desk still fits a narrow screen. */
export function getRestScale(aspect: number) {
  return MathUtils.clamp(1.4 / aspect, 1, 3.1)
}

/** World position of the camera for an orbit offset, in degrees, around its rest pose. */
export function getRestPosition(azimuthOffset = 0, elevationOffset = 0, scale = 1, out = new Vector3()) {
  const azimuth = MathUtils.degToRad(CAMERA.azimuth + azimuthOffset)
  const elevation = MathUtils.degToRad(CAMERA.elevation + elevationOffset)
  const distance = CAMERA.distance * scale
  const flat = Math.cos(elevation) * distance

  return out
    .set(Math.sin(azimuth) * flat, Math.sin(elevation) * distance, Math.cos(azimuth) * flat)
    .add(CAMERA.target)
}

/**
 * Gap under objects resting on a surface. Ink hulls extend below their mesh, so
 * without it the surface hides the bottom of the outline.
 */
export const CONTACT_GAP = 0.03

export const LAPTOP = {
  width: 1.6,
  depth: 1.1,
  baseHeight: 0.06,
  lidHeight: 1.05,
  /** Backward tilt of the open lid, in radians. */
  lidTilt: -0.22,
}

export const DUST = {
  count: 50,
  min: new Vector3(-4.5, -0.2, -1.6),
  size: new Vector3(9, 4.4, 5.4),
  /** Rise speed range, in world units per second. */
  minSpeed: 0.015,
  maxSpeed: 0.06,
  /** Mote diameter range, in world units. */
  minScale: 0.03,
  maxScale: 0.075,
  /** A point in the window that the moon shaft passes through. */
  shaftOrigin: new Vector3(0.3, 2, -1.75),
}

/** Hover response shared by every desk object. */
export const OBJECT_HOVER = {
  /** How far an object rises, in world units. */
  lift: 0.08,
  /** Damping time, in seconds. */
  smoothTime: 0.12,
}

type DeskObjectPlacement = {
  /** Where the object stands on the desk. */
  position: Vector3
  /** The point a close-up centres on. */
  focus: Vector3
  /** Camera distance for the close-up. */
  distance: number
}

export const OBJECTS: Record<SectionId, DeskObjectPlacement> = {
  about: {
    position: new Vector3(-1.3, CONTACT_GAP, -1.15),
    focus: new Vector3(-1.3, 0.55, -1.15),
    distance: 2.5,
  },
  projects: {
    position: new Vector3(0, CONTACT_GAP, 0.2),
    focus: new Vector3(0, 0.5, 0.2),
    distance: 3.1,
  },
  reading: {
    position: new Vector3(1.5, CONTACT_GAP, -0.2),
    focus: new Vector3(1.5, 0.2, -0.2),
    distance: 3.1,
  },
  languages: {
    position: new Vector3(2.5, CONTACT_GAP, -1.15),
    focus: new Vector3(2.5, 0.6, -1.15),
    distance: 2.5,
  },
  resume: {
    position: new Vector3(-1.45, CONTACT_GAP, 0.9),
    focus: new Vector3(-1.45, 0.12, 0.9),
    distance: 2.1,
  },
  now: {
    position: new Vector3(-2.55, CONTACT_GAP, -1.25),
    focus: new Vector3(-2.55, 1.25, -1.25),
    distance: 3.9,
  },
  contact: {
    // Hung on the wall right of the window, apart from the desk objects.
    position: new Vector3(2.75, 1.55, -1.73),
    focus: new Vector3(2.75, 1.55, -1.73),
    distance: 2.9,
  },
}

/** Quill and inkwell: decoration on the desk, not a section. */
export const INKWELL_POSITION = new Vector3(-2.1, CONTACT_GAP, 0.35)

/** Matches the bottom-sheet media query in index.css. */
export function usesBottomSheet(width: number, height: number) {
  return width <= 720 || width / height < 0.9
}

/**
 * Close-up camera pose. On wide screens it sits nearly in front of the object
 * and turns right of it, leaving room for the panel without skewing the object.
 * On narrow screens it backs off to fit the object's width, and aims below it to
 * clear the bottom sheet.
 */
export function getFocusPose(id: SectionId, width: number, height: number, position: Vector3, target: Vector3) {
  const { focus, distance } = OBJECTS[id]

  if (usesBottomSheet(width, height)) {
    const scaled = distance * MathUtils.clamp(1 / (width / height), 1.35, 2.3)
    position.set(0, scaled * 0.16, scaled).add(focus)
    target.set(0, -scaled * 0.17, 0).add(focus)
  } else {
    position.set(distance * 0.05, distance * 0.16, distance).add(focus)
    target.set(distance * 0.26, 0, 0).add(focus)
  }
}
