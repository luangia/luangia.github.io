import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import { CylinderGeometry, type Mesh } from 'three'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { CONTACT_GAP, PALETTE } from './config'
import { InkedMesh } from './InkedMesh'

const dishGeometry = new CylinderGeometry(0.26, 0.3, 0.05, 28)
const waxGeometry = new CylinderGeometry(0.095, 0.11, 0.56, 20)

/** Scenery, not a hotspot. Its flame prints as bare paper. */
export function Candle() {
  const flame = useRef<Mesh>(null!)
  const reducedMotion = useReducedMotion()

  useFrame(({ clock }) => {
    const time = clock.elapsedTime
    const flicker = reducedMotion
      ? 0
      : Math.sin(time * 9.1) * 0.5 + Math.sin(time * 14.3 + 1.2) * 0.3 + Math.sin(time * 3.7) * 0.2

    flame.current.scale.set(0.055, 0.15 * (1 + flicker * 0.1), 0.055)
  })

  return (
    <group position={[-2, CONTACT_GAP, -0.1]}>
      <InkedMesh color={PALETTE.paleGold} geometry={dishGeometry} position={[0, 0.025, 0]} />
      <InkedMesh color={PALETTE.paleGold} geometry={waxGeometry} paint={0.15} position={[0, 0.33, 0]} />
      <mesh position={[0, 0.76, 0]} ref={flame} scale={[0.055, 0.15, 0.055]}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshBasicMaterial color={[4, 2.1, 0.7]} toneMapped={false} />
      </mesh>
    </group>
  )
}
