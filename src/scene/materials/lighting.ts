import { Color, Vector3 } from 'three'

/**
 * Scene lights, held as uniforms shared by every toon material. Updating a
 * value here reaches all of them.
 */
export const lighting = {
  uScreenPos: { value: new Vector3(0, 0.55, 0.25) },
  uScreenColor: { value: new Color('#b9b6ff') },
  uScreenIntensity: { value: 0.75 },
  /** A cool pool on the far side of the desk, so objects there stay readable. */
  uFillPos: { value: new Vector3(2.3, 1.5, 0.9) },
  uFillColor: { value: new Color('#9fb2e8') },
  uFillIntensity: { value: 0.5 },
  /** Direction toward the moon. It sits behind the desk, so it lights edges. */
  uMoonDir: { value: new Vector3(0.25, 0.5, -1).normalize() },
  uMoonColor: { value: new Color('#c4d4ff') },
}
