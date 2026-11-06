import { Canvas } from '@react-three/fiber'
import { Scene } from './scene/Scene'
import { CAMERA, PALETTE, getRestPosition } from './scene/config'

export function App() {
  return (
    <Canvas
      camera={{
        fov: CAMERA.fov,
        near: CAMERA.near,
        far: CAMERA.far,
        position: getRestPosition().toArray(),
      }}
      dpr={[1, 2]}
      gl={{ antialias: true }}
    >
      <color attach="background" args={[PALETTE.ink]} />
      <Scene />
    </Canvas>
  )
}
