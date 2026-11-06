import { CameraRig } from './CameraRig'
import { PALETTE } from './config'
import { Laptop } from './Laptop'

/**
 * Step 1: a bare desk and wall so the camera angle and parallax have something
 * to read against. Lighting and materials here are temporary.
 */
export function Scene() {
  return (
    <>
      <CameraRig />
      <ambientLight color={PALETTE.silver} intensity={2} />
      <directionalLight color={PALETTE.silver} intensity={3} position={[-3, 6, 4]} />

      {/* Desk */}
      <mesh position={[0, -0.15, 0]}>
        <boxGeometry args={[6, 0.3, 3.5]} />
        <meshStandardMaterial color={PALETTE.violet} />
      </mesh>

      {/* Back wall */}
      <mesh position={[0, 4, -1.75]}>
        <planeGeometry args={[40, 20]} />
        <meshStandardMaterial color={PALETTE.indigo} />
      </mesh>

      <Laptop />
    </>
  )
}
