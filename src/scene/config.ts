import { MathUtils, Vector3 } from 'three'
import type { DeskObjectId } from '../state/store'

/** Lunar palette from the PRD's visual pillars. */
export const PALETTE = {
  ink: '#0c0a1a',
  indigo: '#1b1a3f',
  violet: '#3a2a63',
  moss: '#3f5b4a',
  silver: '#c9d1e3',
  paleGold: '#e6d39a',
  ember: '#e8743b',
} as const

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

export const LAPTOP = {
  position: new Vector3(0, 0, 0.2),
  /** How far it rises on hover, in world units. */
  hoverLift: 0.08,
  /** Damping time for hover changes, in seconds. */
  hoverSmoothTime: 0.12,
  width: 1.6,
  depth: 1.1,
  baseHeight: 0.06,
  lidHeight: 1.05,
  /** Backward tilt of the open lid, in radians. */
  lidTilt: -0.22,
}

/**
 * Close-up camera poses. Each sits nearly in front of its object and turns right
 * of it, leaving room for the panel without skewing the object.
 */
export const FOCUS_POSES: Record<DeskObjectId, { position: Vector3; target: Vector3 }> = {
  laptop: {
    position: new Vector3(0.15, 1, 3.3),
    target: new Vector3(0.8, 0.5, 0.2),
  },
}

/** World position of the camera for an orbit offset, in degrees, around its rest pose. */
export function getRestPosition(azimuthOffset = 0, elevationOffset = 0, out = new Vector3()) {
  const azimuth = MathUtils.degToRad(CAMERA.azimuth + azimuthOffset)
  const elevation = MathUtils.degToRad(CAMERA.elevation + elevationOffset)
  const flat = Math.cos(elevation) * CAMERA.distance

  return out
    .set(Math.sin(azimuth) * flat, Math.sin(elevation) * CAMERA.distance, Math.cos(azimuth) * flat)
    .add(CAMERA.target)
}
