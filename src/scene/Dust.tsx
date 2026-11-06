import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo } from 'react'
import { InstancedBufferAttribute, InstancedBufferGeometry, PlaneGeometry } from 'three'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { DUST } from './config'
import { createDustMaterial } from './materials/dust'

function createGeometry() {
  const { count, min, size } = DUST
  const plane = new PlaneGeometry(1, 1)
  const geometry = new InstancedBufferGeometry()
  geometry.index = plane.index
  geometry.setAttribute('position', plane.getAttribute('position'))
  geometry.setAttribute('uv', plane.getAttribute('uv'))
  geometry.instanceCount = count

  const origins = new Float32Array(count * 3)
  const seeds = new Float32Array(count * 3)

  for (let i = 0; i < count; i++) {
    origins.set(
      [min.x + Math.random() * size.x, min.y + Math.random() * size.y, min.z + Math.random() * size.z],
      i * 3,
    )
    seeds.set(
      [
        Math.random() * Math.PI * 2,
        DUST.minSpeed + Math.random() * (DUST.maxSpeed - DUST.minSpeed),
        DUST.minScale + Math.random() ** 2 * (DUST.maxScale - DUST.minScale),
      ],
      i * 3,
    )
  }

  geometry.setAttribute('aOrigin', new InstancedBufferAttribute(origins, 3))
  geometry.setAttribute('aSeed', new InstancedBufferAttribute(seeds, 3))
  return geometry
}

function DustMotes() {
  const geometry = useMemo(createGeometry, [])
  const material = useMemo(createDustMaterial, [])

  useEffect(
    () => () => {
      geometry.dispose()
      material.dispose()
    },
    [geometry, material],
  )

  useFrame((_, delta) => {
    material.uniforms.uTime.value += delta
  })

  return <mesh frustumCulled={false} geometry={geometry} material={material} raycast={() => null} />
}

export function Dust() {
  return useReducedMotion() ? null : <DustMotes />
}
