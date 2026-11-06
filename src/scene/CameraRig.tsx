import { useFrame } from '@react-three/fiber'
import { easing } from 'maath'
import { useMemo } from 'react'
import { Vector3 } from 'three'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { useDeskStore } from '../state/store'
import { CAMERA, FOCUS_POSES, getRestPosition } from './config'

/** Holds the seated view, leans it toward the pointer, and eases to close-ups. */
export function CameraRig() {
  const goal = useMemo(() => new Vector3(), [])
  const look = useMemo(() => CAMERA.target.clone(), [])
  const reducedMotion = useReducedMotion()

  useFrame(({ camera, pointer }, delta) => {
    const { focused } = useDeskStore.getState()
    const { azimuth, elevation, focusDrift } = CAMERA.parallax
    const leanX = reducedMotion ? 0 : pointer.x
    const leanY = reducedMotion ? 0 : pointer.y
    const lookGoal = focused ? FOCUS_POSES[focused].target : CAMERA.target

    if (focused) {
      goal.copy(FOCUS_POSES[focused].position)
      goal.x += leanX * focusDrift
      goal.y += leanY * focusDrift
    } else {
      getRestPosition(leanX * azimuth, leanY * elevation, goal)
    }

    if (reducedMotion) {
      camera.position.copy(goal)
      look.copy(lookGoal)
    } else {
      easing.damp3(camera.position, goal, CAMERA.smoothTime, delta)
      easing.damp3(look, lookGoal, CAMERA.smoothTime, delta)
    }

    camera.lookAt(look)
  })

  return null
}
