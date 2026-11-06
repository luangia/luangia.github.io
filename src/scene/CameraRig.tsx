import { useFrame } from '@react-three/fiber'
import { easing } from 'maath'
import { useMemo } from 'react'
import { Vector3 } from 'three'
import { useDeskStore } from '../state/store'
import { CAMERA, FOCUS_POSES, getRestPosition } from './config'

/** Holds the seated view, leans it toward the pointer, and eases to close-ups. */
export function CameraRig() {
  const goal = useMemo(() => new Vector3(), [])
  const look = useMemo(() => CAMERA.target.clone(), [])

  useFrame(({ camera, pointer }, delta) => {
    const { focused } = useDeskStore.getState()
    const { azimuth, elevation, focusDrift } = CAMERA.parallax

    if (focused) {
      const pose = FOCUS_POSES[focused]
      goal.copy(pose.position)
      goal.x += pointer.x * focusDrift
      goal.y += pointer.y * focusDrift
    } else {
      getRestPosition(pointer.x * azimuth, pointer.y * elevation, goal)
    }

    easing.damp3(camera.position, goal, CAMERA.smoothTime, delta)
    easing.damp3(look, focused ? FOCUS_POSES[focused].target : CAMERA.target, CAMERA.smoothTime, delta)
    camera.lookAt(look)
  })

  return null
}
