import { Canvas } from '@react-three/fiber'
import { site } from './content'
import { Scene } from './scene/Scene'
import { CAMERA, getRestPosition } from './scene/config'
import { useDeskStore } from './state/store'
import { Colophon } from './ui/Colophon'
import { Nav } from './ui/Nav'
import { Panel } from './ui/Panel'

/** The 3D desk. Split out so the simple view never downloads three.js. */
export default function DeskView() {
  const focused = useDeskStore((state) => state.focused)
  const returnToDesk = useDeskStore((state) => state.returnToDesk)

  return (
    <main className="stage" data-focused={focused !== null}>
      <h1 className="visually-hidden">{site.title}</h1>
      <Nav />

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
          onPointerMissed={() => {
            if (useDeskStore.getState().focused) returnToDesk()
          }}
        >
          <color attach="background" args={['#ffffff']} />
          <Scene />
        </Canvas>
      </div>

      <Colophon className="colophon" />
      <Panel />
    </main>
  )
}
