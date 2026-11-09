import { useEffect, useMemo } from 'react'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'
import { LAPTOP, PALETTE } from '../config'
import { InkedMesh } from '../InkedMesh'
import { createScreenMaterial } from '../materials/emissive'
import { DeskObject } from './DeskObject'

const { width, depth, baseHeight, lidHeight, lidTilt } = LAPTOP

const baseGeometry = new RoundedBoxGeometry(width, baseHeight, depth, 3, 0.02)
const deckGeometry = new RoundedBoxGeometry(width - 0.2, 0.01, depth - 0.45, 1, 0.004)
const lidGeometry = new RoundedBoxGeometry(width, lidHeight, 0.04, 3, 0.018)

const SCREEN_WIDTH = width - 0.14
const SCREEN_HEIGHT = lidHeight - 0.13

/** Placeholder model, shaded and inked like the final object will be. */
export function Laptop() {
  const screen = useMemo(() => createScreenMaterial(SCREEN_WIDTH, SCREEN_HEIGHT), [])

  useEffect(() => () => screen.dispose(), [screen])

  return (
    <DeskObject
      hitArea={{ position: [0, lidHeight / 2, 0], size: [width + 0.1, lidHeight + 0.25, depth + 0.3] }}
      id="projects"
      labelHeight={lidHeight + 0.35}
    >
      {({ rimBoost, ring }) => (
        <>
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
        </>
      )}
    </DeskObject>
  )
}
