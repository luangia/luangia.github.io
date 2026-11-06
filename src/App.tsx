import { Canvas } from '@react-three/fiber'
import { site } from './content'
import { Scene } from './scene/Scene'
import { CAMERA, PALETTE, getRestPosition } from './scene/config'
import { useDeskStore } from './state/store'
import { DeskControls } from './ui/DeskControls'
import { ProjectsPanel } from './ui/ProjectsPanel'

export function App() {
  const focused = useDeskStore((state) => state.focused)
  const returnToDesk = useDeskStore((state) => state.returnToDesk)

  return (
    <main className="stage" data-focused={focused !== null}>
      <h1 className="visually-hidden">{site.title}</h1>

      <div aria-label={site.sceneDescription} className="scene" role="img">
        <Canvas
          camera={{
            fov: CAMERA.fov,
            near: CAMERA.near,
            far: CAMERA.far,
            position: getRestPosition().toArray(),
          }}
          dpr={[1, 2]}
          flat
          gl={{ antialias: false }}
          onPointerMissed={returnToDesk}
        >
          <color attach="background" args={[PALETTE.ink]} />
          <Scene />
        </Canvas>
      </div>

      <DeskControls />
      <ProjectsPanel />
    </main>
  )
}
