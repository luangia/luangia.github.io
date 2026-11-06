import { Color, Vector3 } from 'three'

/**
 * Scene lights, held as uniforms shared by every toon material. Updating a
 * value here reaches all of them, which is how the candle flickers.
 */
export const lighting = {
  uCandlePos: { value: new Vector3(-2, 0.82, -0.1) },
  uCandleColor: { value: new Color('#ffb066') },
  uCandleIntensity: { value: 1.5 },
  uScreenPos: { value: new Vector3(0, 0.55, 0.25) },
  uScreenColor: { value: new Color('#b9b6ff') },
  uScreenIntensity: { value: 0.75 },
  /** Direction toward the moon. It sits behind the desk, so it lights edges. */
  uMoonDir: { value: new Vector3(0.25, 0.5, -1).normalize() },
  uMoonColor: { value: new Color('#c4d4ff') },
}
