import { CylinderGeometry, ExtrudeGeometry, Shape } from 'three'
import { INKWELL_POSITION, PALETTE } from '../config'
import { InkedMesh } from '../InkedMesh'

function createFeatherGeometry() {
  const feather = new Shape()
  feather.moveTo(0, 0)
  feather.bezierCurveTo(0.09, 0.2, 0.17, 0.5, 0.05, 1)
  feather.bezierCurveTo(-0.06, 0.78, -0.1, 0.4, 0, 0.16)
  feather.lineTo(0, 0)
  return new ExtrudeGeometry(feather, { depth: 0.006, bevelEnabled: false, curveSegments: 24 })
}

const wellGeometry = new CylinderGeometry(0.15, 0.17, 0.17, 24)
const neckGeometry = new CylinderGeometry(0.08, 0.1, 0.06, 20)
const featherGeometry = createFeatherGeometry()

/** Decoration, not a section: Contact now hangs on the wall as a letter rack. */
export function Inkwell() {
  return (
    <group position={INKWELL_POSITION}>
      <InkedMesh color={PALETTE.indigo} geometry={wellGeometry} position={[0, 0.085, 0]} />
      <InkedMesh color={PALETTE.indigo} geometry={neckGeometry} outline={0.008} position={[0, 0.2, 0]} />
      <InkedMesh
        color={PALETTE.silver}
        geometry={featherGeometry}
        outline={0.007}
        paint={0.15}
        position={[0, 0.16, 0]}
        rotation={[0.1, 0.5, -0.3]}
      />
    </group>
  )
}
