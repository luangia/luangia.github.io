import { useFBO } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { EffectComposer } from '@react-three/postprocessing'
import { easing } from 'maath'
import { useEffect, useMemo } from 'react'
import { Color, NearestFilter } from 'three'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { useDeskStore } from '../state/store'
import { CAMERA, usesBottomSheet } from './config'
import { RisoEffect } from './print/RisoEffect'
import { TEXT_REGION_LAYER, regionBoxes, regionPass } from './print/regions'

/** The whole look lives in one print pass, so every object gets it. */
export function Effects() {
  const riso = useMemo(() => new RisoEffect(), [])
  const reducedMotion = useReducedMotion()
  const regions = useFBO({ minFilter: NearestFilter, magFilter: NearestFilter, generateMipmaps: false })
  const clearColor = useMemo(() => new Color(), [])

  useEffect(() => () => riso.dispose(), [riso])

  useFrame(({ camera, gl, scene, size }, delta) => {
    const goal = useDeskStore.getState().focused ? 1 : 0
    const ratio = gl.getPixelRatio()
    riso.setPixelRatio(ratio)
    riso.setFocusLayout(usesBottomSheet(size.width, size.height))

    if (reducedMotion) riso.dim.value = goal
    else easing.damp(riso.dim, 'value', goal, CAMERA.smoothTime, delta)

    // Region pass: draw only the inked meshes, each as its region's ID, so the
    // print knows which passage to set every pixel in. The room fills the rest.
    regionBoxes[0].set(0, 0, size.width * ratio, size.height * ratio)

    const background = scene.background
    const layers = camera.layers.mask
    const clearAlpha = gl.getClearAlpha()
    gl.getClearColor(clearColor)

    scene.background = null
    camera.layers.set(TEXT_REGION_LAYER)
    regionPass.value = 1
    gl.setRenderTarget(regions)
    gl.setClearColor(0x000000, 0)
    gl.clear()
    gl.render(scene, camera)

    gl.setRenderTarget(null)
    gl.setClearColor(clearColor, clearAlpha)
    regionPass.value = 0
    camera.layers.mask = layers
    scene.background = background

    riso.setRegions(regions.texture)
  })

  // No MSAA: a print needs no smoothing, and it keeps key lines pure black.
  return (
    <EffectComposer multisampling={0}>
      <primitive dispose={null} object={riso} />
    </EffectComposer>
  )
}
