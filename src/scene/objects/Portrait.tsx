import { BoxGeometry, CircleGeometry, Shape, ShapeGeometry } from 'three'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'
import { PALETTE } from '../config'
import { InkedMesh } from '../InkedMesh'
import { DeskObject } from './DeskObject'

const FRAME_WIDTH = 0.82
const FRAME_HEIGHT = 1.08
const BACK_LEAN = -0.13

function createShouldersGeometry() {
  const shoulders = new Shape()
  shoulders.moveTo(-0.27, -0.42)
  shoulders.bezierCurveTo(-0.27, -0.14, -0.14, -0.08, 0, -0.08)
  shoulders.bezierCurveTo(0.14, -0.08, 0.27, -0.14, 0.27, -0.42)
  shoulders.lineTo(-0.27, -0.42)
  return new ShapeGeometry(shoulders, 24)
}

const frameGeometry = new RoundedBoxGeometry(FRAME_WIDTH, FRAME_HEIGHT, 0.06, 3, 0.02)
const canvasGeometry = new BoxGeometry(FRAME_WIDTH - 0.16, FRAME_HEIGHT - 0.16, 0.012)
const headGeometry = new CircleGeometry(0.13, 32)
const shouldersGeometry = createShouldersGeometry()
const strutGeometry = new BoxGeometry(0.1, 0.7, 0.02)

/** The silhouette is a stand-in until the illustrated avatar exists. */
export function Portrait() {
  return (
    <DeskObject
      hitArea={{ position: [0, FRAME_HEIGHT / 2, 0], size: [FRAME_WIDTH + 0.1, FRAME_HEIGHT + 0.15, 0.5] }}
      id="about"
      labelHeight={FRAME_HEIGHT + 0.25}
    >
      {({ rimBoost, ring }) => (
        <group rotation={[0, 0.16, 0]}>
          <group position={[0, FRAME_HEIGHT / 2, 0]} rotation={[BACK_LEAN, 0, 0]}>
            <InkedMesh color={PALETTE.paleGold} geometry={frameGeometry} rimBoost={rimBoost} ring={ring} />
            <InkedMesh color={PALETTE.violet} geometry={canvasGeometry} outline={0.006} position={[0, 0, 0.034]} rim={0} />
            <InkedMesh color={PALETTE.silver} geometry={headGeometry} outline={0.006} position={[0, 0.1, 0.042]} rim={0} />
            <InkedMesh color={PALETTE.moss} geometry={shouldersGeometry} outline={0.006} position={[0, 0, 0.042]} rim={0} />
          </group>
          <InkedMesh
            color={PALETTE.wood}
            geometry={strutGeometry}
            outline={0.006}
            position={[0, 0.34, -0.19]}
            rim={0}
            rotation={[0.3, 0, 0]}
          />
        </group>
      )}
    </DeskObject>
  )
}
