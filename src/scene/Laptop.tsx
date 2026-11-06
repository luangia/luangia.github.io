import { Html, useCursor } from '@react-three/drei'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import { easing } from 'maath'
import { useEffect, useMemo, useRef, useState } from 'react'
import { type Group } from 'three'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'
import { site } from '../content'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { useDeskStore } from '../state/store'
import { LAPTOP, PALETTE } from './config'
import { InkedMesh } from './InkedMesh'
import { createScreenMaterial } from './materials/emissive'
import type { SharedFloat } from './materials/toon'

const { width, depth, baseHeight, lidHeight, lidTilt } = LAPTOP

const baseGeometry = new RoundedBoxGeometry(width, baseHeight, depth, 3, 0.02)
const deckGeometry = new RoundedBoxGeometry(width - 0.2, 0.01, depth - 0.45, 1, 0.004)
const lidGeometry = new RoundedBoxGeometry(width, lidHeight, 0.04, 3, 0.018)

const SCREEN_WIDTH = width - 0.14
const SCREEN_HEIGHT = lidHeight - 0.13

/** Placeholder model, shaded and inked like the final object will be. */
export function Laptop() {
  const focused = useDeskStore((state) => state.focused)
  const focus = useDeskStore((state) => state.focus)
  const returnToDesk = useDeskStore((state) => state.returnToDesk)
  const keyboardFocused = useDeskStore((state) => state.keyboardTarget === 'laptop')
  const [hovered, setHovered] = useState(false)
  const reducedMotion = useReducedMotion()
  const active = (hovered || keyboardFocused) && focused === null
  const showRing = keyboardFocused && focused === null
  const lifted = useRef<Group>(null!)
  const rimBoost = useMemo<SharedFloat>(() => ({ value: 0 }), [])
  const ring = useMemo<SharedFloat>(() => ({ value: 0 }), [])
  const screen = useMemo(() => createScreenMaterial(SCREEN_WIDTH, SCREEN_HEIGHT), [])

  useEffect(() => () => screen.dispose(), [screen])

  useCursor(hovered && focused === null)

  useFrame((_, delta) => {
    const { hoverLift, hoverSmoothTime } = LAPTOP
    const smoothTime = reducedMotion ? 0 : hoverSmoothTime

    easing.damp(lifted.current.position, 'y', active && !reducedMotion ? hoverLift : 0, smoothTime, delta)
    easing.damp(rimBoost, 'value', active ? 1 : 0, smoothTime, delta)
    easing.damp(ring, 'value', showRing ? 1 : 0, smoothTime, delta)
  })

  const handleOver = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation()
    setHovered(true)
  }

  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation()

    // Its hit area overhangs the model, so while open it counts as "outside".
    if (focused === null) focus('laptop')
    else returnToDesk()
  }

  return (
    <group position={LAPTOP.position}>
      {/* Stays put while the model lifts, so the rise can't flicker the hover off. */}
      <mesh
        position={[0, lidHeight / 2, 0]}
        visible={false}
        onClick={handleClick}
        onPointerOut={() => setHovered(false)}
        onPointerOver={handleOver}
      >
        <boxGeometry args={[width + 0.1, lidHeight + 0.25, depth + 0.3]} />
      </mesh>

      <group ref={lifted}>
        <InkedMesh
          color={PALETTE.silver}
          geometry={baseGeometry}
          position={[0, baseHeight / 2, 0]}
          rimBoost={rimBoost}
          ring={ring}
        />
        <InkedMesh
          color={PALETTE.indigo}
          geometry={deckGeometry}
          outline={0.006}
          position={[0, baseHeight + 0.002, -0.08]}
          rim={0}
        />

        {/* Lid, hinged at the back edge of the base */}
        <group position={[0, baseHeight, -depth / 2]} rotation={[lidTilt, 0, 0]}>
          <InkedMesh
            color={PALETTE.silver}
            geometry={lidGeometry}
            position={[0, lidHeight / 2, 0]}
            rimBoost={rimBoost}
            ring={ring}
          />
          <mesh material={screen} position={[0, lidHeight / 2, 0.021]}>
            <planeGeometry args={[SCREEN_WIDTH, SCREEN_HEIGHT]} />
          </mesh>
        </group>

        {active && (
          <Html center position={[0, lidHeight + 0.35, 0]} wrapperClass="object-label-anchor">
            <div className="object-label">{site.objects.laptop.label}</div>
          </Html>
        )}
      </group>
    </group>
  )
}
