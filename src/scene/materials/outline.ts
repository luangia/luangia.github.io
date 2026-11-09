import { BackSide, BufferAttribute, Color, ShaderMaterial, type BufferGeometry } from 'three'
import { KEY_LINE, RISO } from '../config'
import { regionPass } from '../print/regions'
import { noiseGlsl } from './noise.glsl'
import type { SharedFloat } from './toon'

const vertexShader = /* glsl */ `
  attribute vec3 aOutlineNormal;
  uniform float uThickness;
  uniform float uRing;

  ${noiseGlsl}

  void main() {
    vec4 world = modelMatrix * vec4(position, 1.0);
    vec3 normal = normalize(mat3(modelMatrix) * aOutlineNormal);

    // Thickness drifts along the surface, so lines swell and taper like ink.
    float inked = uThickness * (0.45 + 1.1 * noise(world.xyz * 3.5));
    world.xyz += normal * mix(inked, 0.03, uRing);
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`

const fragmentShader = /* glsl */ `
  uniform vec3 uColor;
  uniform vec3 uRingColor;
  uniform float uRing;
  uniform float uRegionPass;
  uniform float uRegion;

  void main() {
    if (uRegionPass > 0.5) {
      gl_FragColor = vec4(uRegion / 255.0, 0.0, 0.0, 1.0);
      return;
    }

    gl_FragColor = vec4(mix(uColor, uRingColor, uRing), 1.0);
    #include <colorspace_fragment>
  }
`

const inkColor = new Color(KEY_LINE)
/** Printed in the highlight ink, like the hover. */
const ringColor = new Color(RISO.pink)

export function createOutlineMaterial(thickness: number, ring: SharedFloat, region: number) {
  return new ShaderMaterial({
    vertexShader,
    fragmentShader,
    side: BackSide,
    uniforms: {
      uColor: { value: inkColor },
      uRingColor: { value: ringColor },
      uThickness: { value: thickness },
      uRing: ring,
      uRegion: { value: region },
      uRegionPass: regionPass,
    },
  })
}

/**
 * Stores normals averaged across coincident vertices. Hard-edged shapes split
 * their vertices, so pushing along the real normals would tear the hull open at
 * every corner.
 */
export function addOutlineNormals(geometry: BufferGeometry) {
  if (geometry.hasAttribute('aOutlineNormal')) return geometry

  const position = geometry.getAttribute('position')
  const normal = geometry.getAttribute('normal')
  const sums = new Map<string, [number, number, number]>()
  const keyAt = (i: number) =>
    `${position.getX(i).toFixed(4)},${position.getY(i).toFixed(4)},${position.getZ(i).toFixed(4)}`

  for (let i = 0; i < position.count; i++) {
    const key = keyAt(i)
    const sum = sums.get(key) ?? [0, 0, 0]
    sum[0] += normal.getX(i)
    sum[1] += normal.getY(i)
    sum[2] += normal.getZ(i)
    sums.set(key, sum)
  }

  const smoothed = new Float32Array(position.count * 3)

  for (let i = 0; i < position.count; i++) {
    const [x, y, z] = sums.get(keyAt(i))!
    const length = Math.hypot(x, y, z) || 1
    smoothed.set([x / length, y / length, z / length], i * 3)
  }

  geometry.setAttribute('aOutlineNormal', new BufferAttribute(smoothed, 3))
  return geometry
}
