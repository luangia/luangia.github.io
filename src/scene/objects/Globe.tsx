import { CylinderGeometry, SphereGeometry, TorusGeometry } from 'three'
import { PALETTE } from '../config'
import { InkedMesh } from '../InkedMesh'
import { DeskObject } from './DeskObject'

const RADIUS = 0.44
const CENTER_Y = 0.66
const TILT = 0.41

const baseGeometry = new CylinderGeometry(0.27, 0.32, 0.06, 32)
const postGeometry = new CylinderGeometry(0.035, 0.05, CENTER_Y - RADIUS, 12)
const globeGeometry = new SphereGeometry(RADIUS, 40, 28)
const meridianGeometry = new TorusGeometry(RADIUS + 0.055, 0.016, 8, 64, Math.PI * 1.2)

export function Globe() {
  return (
    <DeskObject
      hitArea={{ position: [0, 0.6, 0], size: [1.1, 1.3, 1.1] }}
      id="languages"
      labelHeight={1.4}
    >
      {({ rimBoost, ring }) => (
        <>
          <InkedMesh color={PALETTE.paleGold} geometry={baseGeometry} position={[0, 0.03, 0]} rimBoost={rimBoost} ring={ring} />
          <InkedMesh color={PALETTE.paleGold} geometry={postGeometry} position={[0, 0.06 + (CENTER_Y - RADIUS) / 2, 0]} outline={0.008} />

          <group position={[0, CENTER_Y, 0]} rotation={[0, 0, TILT]}>
            <InkedMesh color={PALETTE.ocean} geometry={globeGeometry} patch={PALETTE.land} rimBoost={rimBoost} ring={ring} />
            <InkedMesh
              color={PALETTE.paleGold}
              geometry={meridianGeometry}
              outline={0.007}
              rotation={[0, 0, -Math.PI * 0.1]}
            />
          </group>
        </>
      )}
    </DeskObject>
  )
}
