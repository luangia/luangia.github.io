import { useFrame } from '@react-three/fiber'
import { EffectComposer } from '@react-three/postprocessing'
import { easing } from 'maath'
import { useEffect, useMemo } from 'react'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { useDeskStore } from '../state/store'
import { CAMERA, usesBottomSheet } from './config'
import { RisoEffect } from './print/RisoEffect'

/** The whole look lives in one print pass, so every object gets it. */
export function Effects() {
  const riso = useMemo(() => new RisoEffect(), [])
  const reducedMotion = useReducedMotion()

  useEffect(() => () => riso.dispose(), [riso])

  useFrame(({ gl, size }, delta) => {
    const goal = useDeskStore.getState().focused ? 1 : 0
    riso.setPixelRatio(gl.getPixelRatio())
    riso.setFocusLayout(usesBottomSheet(size.width, size.height))

    if (reducedMotion) riso.dim.value = goal
    else easing.damp(riso.dim, 'value', goal, CAMERA.smoothTime, delta)
  })

  // No MSAA: a print needs no smoothing, and it keeps key lines pure black.
  return (
    <EffectComposer multisampling={0}>
      <primitive dispose={null} object={riso} />
    </EffectComposer>
  )
}
