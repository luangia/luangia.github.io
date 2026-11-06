import { Canvas } from '@react-three/fiber'
import { Scene } from './scene/Scene'
import { CAMERA, PALETTE, getRestPosition } from './scene/config'
import { useDeskStore } from './state/store'
import { ProjectsPanel } from './ui/ProjectsPanel'

export function App() {
  const returnToDesk = useDeskStore((state) => state.returnToDesk)

  return (
    <>
      <Canvas
        camera={{
          fov: CAMERA.fov,
          near: CAMERA.near,
          far: CAMERA.far,
          position: getRestPosition().toArray(),
        }}
        dpr={[1, 2]}
        flat
        gl={{ antialias: true }}
        onPointerMissed={returnToDesk}
      >
        <color attach="background" args={[PALETTE.ink]} />
        <Scene />
      </Canvas>
      <ProjectsPanel />
    </>
  )
}
