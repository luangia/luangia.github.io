import { BackSide, BufferAttribute, Color, ShaderMaterial, type BufferGeometry } from 'three'
import { PALETTE } from '../config'
import { noiseGlsl } from './noise.glsl'

const vertexShader = /* glsl */ `
  attribute vec3 aOutlineNormal;
  uniform float uThickness;

  ${noiseGlsl}

  void main() {
    vec4 world = modelMatrix * vec4(position, 1.0);
    vec3 normal = normalize(mat3(modelMatrix) * aOutlineNormal);

    // Thickness drifts along the surface, so lines swell and taper like ink.
    world.xyz += normal * uThickness * (0.45 + 1.1 * noise(world.xyz * 3.5));
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`

const fragmentShader = /* glsl */ `
  uniform vec3 uColor;

  void main() {
    gl_FragColor = vec4(uColor, 1.0);
    #include <colorspace_fragment>
  }
`

const inkColor = new Color(PALETTE.ink)

export function createOutlineMaterial(thickness: number) {
  return new ShaderMaterial({
    vertexShader,
    fragmentShader,
    side: BackSide,
    uniforms: {
      uColor: { value: inkColor },
      uThickness: { value: thickness },
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
