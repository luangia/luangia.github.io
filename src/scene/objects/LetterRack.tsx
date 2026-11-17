import { BoxGeometry, CylinderGeometry } from 'three'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'
import { PALETTE } from '../config'
import { InkedMesh } from '../InkedMesh'
import { DeskObject } from './DeskObject'

const WIDTH = 0.72
const BACK_HEIGHT = 0.62
const POCKET_HEIGHT = 0.3
/** Drawn at this scale so it still reads as a rack from the desk view. */
const RACK_SCALE = 1.4

const backGeometry = new RoundedBoxGeometry(WIDTH, BACK_HEIGHT, 0.04, 2, 0.015)
const pocketGeometry = new RoundedBoxGeometry(WIDTH, POCKET_HEIGHT, 0.05, 2, 0.015)
const envelopeGeometry = new BoxGeometry(0.56, 0.38, 0.008)
const sealGeometry = new CylinderGeometry(0.055, 0.062, 0.018, 24)
const nailGeometry = new CylinderGeometry(0.018, 0.018, 0.03, 12)

/** Contact: a letter rack on the wall, set apart from the objects on the desk. */
export function LetterRack() {
  return (
    <DeskObject
      hitArea={{ position: [0, 0.02, 0.1], size: [(WIDTH + 0.12) * RACK_SCALE, (BACK_HEIGHT + 0.2) * RACK_SCALE, 0.35] }}
      id="contact"
      labelHeight={(BACK_HEIGHT / 2) * RACK_SCALE + 0.3}
    >
      {({ rimBoost, ring }) => (
        <group scale={RACK_SCALE}>
          <InkedMesh color={PALETTE.wood} geometry={backGeometry} position={[0, 0, 0.02]} rimBoost={rimBoost} ring={ring} />
          <InkedMesh color={PALETTE.paleGold} geometry={nailGeometry} outline={0.005} position={[0, BACK_HEIGHT / 2 - 0.06, 0.055]} rotation={[Math.PI / 2, 0, 0]} />

          {/* Envelopes standing in the pocket, the front one sealed in pink. */}
          <InkedMesh color={PALETTE.paleGold} geometry={envelopeGeometry} outline={0.006} paint={0.2} position={[0.06, 0.02, 0.06]} rotation={[0, 0, -0.12]} />
          <group position={[-0.05, -0.02, 0.075]} rotation={[0, 0, 0.08]}>
            <InkedMesh color={PALETTE.silver} geometry={envelopeGeometry} outline={0.006} paint={0.2} rimBoost={rimBoost} ring={ring} />
            <InkedMesh color={PALETTE.ember} geometry={sealGeometry} outline={0.005} position={[0, 0.06, 0.012]} rotation={[Math.PI / 2, 0, 0]} />
          </group>

          <InkedMesh color={PALETTE.wood} geometry={pocketGeometry} position={[0, -BACK_HEIGHT / 2 + POCKET_HEIGHT / 2, 0.095]} rimBoost={rimBoost} ring={ring} />
        </group>
      )}
    </DeskObject>
  )
}
