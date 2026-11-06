import { Html, useCursor } from '@react-three/drei'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import { easing } from 'maath'
import { useEffect, useMemo, useRef, useState } from 'react'
import { MeshStandardMaterial, type Group } from 'three'
import { site } from '../content'
import { useDeskStore } from '../state/store'
import { LAPTOP, PALETTE } from './config'

const { width, depth, baseHeight, lidHeight, lidTilt } = LAPTOP

/**
 * Placeholder laptop. Geometry and materials are temporary. The hover glow
 * stands in for the rim light that the toon shader takes over in step 3.
 */
export function Laptop() {
  const focused = useDeskStore((state) => state.focused)
  const focus = useDeskStore((state) => state.focus)
  const [hovered, setHovered] = useState(false)
  const active = hovered && focused === null
  const lifted = useRef<Group>(null!)

  const shell = useMemo(
    () =>
      new MeshStandardMaterial({
        color: PALETTE.silver,
        emissive: PALETTE.silver,
        emissiveIntensity: 0,
      }),
    [],
  )
  useEffect(() => () => shell.dispose(), [shell])

  useCursor(active)

  useFrame((_, delta) => {
    easing.damp(lifted.current.position, 'y', active ? LAPTOP.hoverLift : 0, LAPTOP.hoverSmoothTime, delta)
    easing.damp(shell, 'emissiveIntensity', active ? 0.35 : 0, LAPTOP.hoverSmoothTime, delta)
  })

  const handleOver = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation()
    setHovered(true)
  }

  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation()
    if (focused === null) focus('laptop')
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
        {/* Base */}
        <mesh material={shell} position={[0, baseHeight / 2, 0]}>
          <boxGeometry args={[width, baseHeight, depth]} />
        </mesh>

        {/* Keyboard deck */}
        <mesh position={[0, baseHeight + 0.002, -0.08]}>
          <boxGeometry args={[width - 0.2, 0.004, depth - 0.45]} />
          <meshStandardMaterial color={PALETTE.indigo} />
        </mesh>

        {/* Lid, hinged at the back edge of the base */}
        <group position={[0, baseHeight, -depth / 2]} rotation={[lidTilt, 0, 0]}>
          <mesh material={shell} position={[0, lidHeight / 2, 0]}>
            <boxGeometry args={[width, lidHeight, 0.04]} />
          </mesh>
          <mesh position={[0, lidHeight / 2, 0.021]}>
            <planeGeometry args={[width - 0.14, lidHeight - 0.13]} />
            <meshBasicMaterial color={PALETTE.paleGold} />
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
