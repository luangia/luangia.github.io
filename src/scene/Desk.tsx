import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'
import { PALETTE } from './config'
import { InkedMesh } from './InkedMesh'

const topGeometry = new RoundedBoxGeometry(6, 0.3, 3.5, 3, 0.04)

export function Desk() {
  return (
    <InkedMesh
      color={PALETTE.wood}
      geometry={topGeometry}
      outline={0.018}
      paint={0.8}
      position={[0, -0.15, 0]}
      rim={0}
    />
  )
}
