import { useFrame } from '@react-three/fiber'
import { Bloom, EffectComposer } from '@react-three/postprocessing'
import { easing } from 'maath'
import { useEffect, useMemo } from 'react'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { useDeskStore } from '../state/store'
import { CAMERA } from './config'
import { PaperEffect } from './materials/paper'

/**
 * Bloom is selective by brightness: toon surfaces stay below 1, while the moon,
 * screen and flame render above it, so only they glow.
 */
export function Effects() {
  const paper = useMemo(() => new PaperEffect(), [])
  const reducedMotion = useReducedMotion()

  useEffect(() => () => paper.dispose(), [paper])

  useFrame((_, delta) => {
    const goal = useDeskStore.getState().focused ? 1 : 0

    if (reducedMotion) paper.dim.value = goal
    else easing.damp(paper.dim, 'value', goal, CAMERA.smoothTime, delta)
  })

  return (
    <EffectComposer multisampling={4}>
      <Bloom intensity={0.75} luminanceSmoothing={0.2} luminanceThreshold={1} mipmapBlur radius={0.7} />
      <primitive dispose={null} object={paper} />
    </EffectComposer>
  )
}
