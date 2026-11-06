import { MathUtils, Vector3 } from 'three'

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
    /** Damping time in seconds; higher is lazier. */
    smoothTime: 0.35,
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
