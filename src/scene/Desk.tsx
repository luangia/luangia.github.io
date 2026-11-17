import { CylinderGeometry } from 'three'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'
import { PALETTE } from './config'
import { InkedMesh } from './InkedMesh'
import { NO_TEXT_REGION, TextRegionContext } from './print/regions'

const LEG_HEIGHT = 5
const LEG_X = 2.72
const LEG_Z = 1.46
const TOP_UNDERSIDE = -0.3

const topGeometry = new RoundedBoxGeometry(6, 0.3, 3.5, 3, 0.04)
const apronGeometry = new RoundedBoxGeometry(5.3, 0.4, 3, 2, 0.02)
const legGeometry = new CylinderGeometry(0.15, 0.075, LEG_HEIGHT, 20)

const LEGS: [number, number][] = [
  [-LEG_X, LEG_Z],
  [LEG_X, LEG_Z],
  [-LEG_X, -LEG_Z],
  [LEG_X, -LEG_Z],
]

/** The legs and apron only come into frame on narrow screens. */
export function Desk() {
  // The desk carries no passage; its blue prints as plain dots.
  return (
    <TextRegionContext.Provider value={NO_TEXT_REGION}>
      <InkedMesh
        color={PALETTE.deskWood}
        flat
        geometry={topGeometry}
        outline={0.018}
        paint={0.8}
        position={[0, -0.15, 0]}
        rim={0}
      />
      <InkedMesh
        color={PALETTE.deskWood}
        flat
        geometry={apronGeometry}
        outline={0.018}
        paint={0.8}
        position={[0, TOP_UNDERSIDE - 0.2, 0]}
        rim={0}
      />
      {LEGS.map(([x, z]) => (
        <InkedMesh
          color={PALETTE.deskWood}
        flat
          geometry={legGeometry}
          key={`${x},${z}`}
          outline={0.018}
          paint={0.5}
          position={[x, TOP_UNDERSIDE - LEG_HEIGHT / 2, z]}
          rim={0}
        />
      ))}
    </TextRegionContext.Provider>
  )
}
