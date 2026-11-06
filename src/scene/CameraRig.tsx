import { useFrame } from '@react-three/fiber'
import { easing } from 'maath'
import { useMemo } from 'react'
import { Vector3 } from 'three'
import { CAMERA, getRestPosition } from './config'

/** Holds the fixed seated view and orbits it a few degrees toward the pointer. */
export function CameraRig() {
  const goal = useMemo(() => new Vector3(), [])

  useFrame(({ camera, pointer }, delta) => {
    getRestPosition(pointer.x * CAMERA.parallax.azimuth, pointer.y * CAMERA.parallax.elevation, goal)
    easing.damp3(camera.position, goal, CAMERA.parallax.smoothTime, delta)
    camera.lookAt(CAMERA.target)
  })

  return null
}
