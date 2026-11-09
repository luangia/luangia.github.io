import { BoxGeometry, CylinderGeometry, TorusGeometry } from 'three'
import { PALETTE } from '../config'
import { InkedMesh } from '../InkedMesh'
import { DeskObject } from './DeskObject'

const LENGTH = 1.04
const ROLL_RADIUS = 0.11
const END_RADIUS = 0.055
const SHEET_DEPTH = 0.42

const rollGeometry = new CylinderGeometry(ROLL_RADIUS, ROLL_RADIUS, LENGTH, 28)
const endRollGeometry = new CylinderGeometry(END_RADIUS, END_RADIUS, LENGTH - 0.02, 20)
const sheetGeometry = new BoxGeometry(LENGTH - 0.02, 0.008, SHEET_DEPTH)
const ribbonGeometry = new TorusGeometry(ROLL_RADIUS + 0.008, 0.016, 8, 32)
const QUARTER_TURN = Math.PI / 2

export function Scroll() {
  return (
    <DeskObject
      hitArea={{ position: [0, 0.12, 0.15], size: [1.3, 0.45, 1.0] }}
      id="resume"
      labelHeight={0.5}
    >
      {({ rimBoost, ring }) => (
        <group rotation={[0, 0.42, 0]}>
          <InkedMesh
            color={PALETTE.paleGold}
            geometry={rollGeometry}
            paint={0.3}
            position={[0, ROLL_RADIUS, 0]}
            rimBoost={rimBoost}
            ring={ring}
            rotation={[0, 0, QUARTER_TURN]}
          />
          <InkedMesh color={PALETTE.ember} geometry={ribbonGeometry} outline={0.006} position={[0.2, ROLL_RADIUS, 0]} rotation={[0, QUARTER_TURN, 0]} />
          <InkedMesh color={PALETTE.paleGold} geometry={sheetGeometry} outline={0.006} paint={0.25} position={[0, 0.006, SHEET_DEPTH / 2 + 0.04]} rim={0} />
          <InkedMesh
            color={PALETTE.paleGold}
            geometry={endRollGeometry}
            paint={0.3}
            position={[0, END_RADIUS, SHEET_DEPTH + 0.06]}
            rimBoost={rimBoost}
            ring={ring}
            rotation={[0, 0, QUARTER_TURN]}
          />
        </group>
      )}
    </DeskObject>
  )
}
