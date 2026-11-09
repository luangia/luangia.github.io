import { BoxGeometry, CylinderGeometry, ExtrudeGeometry, Shape, ShapeGeometry } from 'three'
import { PALETTE } from '../config'
import { InkedMesh } from '../InkedMesh'
import { DeskObject } from './DeskObject'

const ENVELOPE_WIDTH = 0.82
const ENVELOPE_DEPTH = 0.54
const QUARTER_TURN = Math.PI / 2

function createFlapGeometry() {
  const halfWidth = ENVELOPE_WIDTH / 2 - 0.01
  const flap = new Shape()
  flap.moveTo(-halfWidth, 0)
  flap.lineTo(halfWidth, 0)
  flap.lineTo(0, -ENVELOPE_DEPTH * 0.62)
  flap.lineTo(-halfWidth, 0)
  return new ShapeGeometry(flap)
}

function createFeatherGeometry() {
  const feather = new Shape()
  feather.moveTo(0, 0)
  feather.bezierCurveTo(0.09, 0.2, 0.17, 0.5, 0.05, 1)
  feather.bezierCurveTo(-0.06, 0.78, -0.1, 0.4, 0, 0.16)
  feather.lineTo(0, 0)
  return new ExtrudeGeometry(feather, { depth: 0.006, bevelEnabled: false, curveSegments: 24 })
}

const envelopeGeometry = new BoxGeometry(ENVELOPE_WIDTH, 0.02, ENVELOPE_DEPTH)
const flapGeometry = createFlapGeometry()
const sealGeometry = new CylinderGeometry(0.068, 0.076, 0.022, 24)
const wellGeometry = new CylinderGeometry(0.15, 0.17, 0.17, 24)
const neckGeometry = new CylinderGeometry(0.08, 0.1, 0.06, 20)
const featherGeometry = createFeatherGeometry()

export function Letter() {
  return (
    <DeskObject
      hitArea={{ position: [-0.08, 0.42, -0.08], size: [1.1, 1.1, 1.15] }}
      id="contact"
      labelHeight={1.25}
    >
      {({ rimBoost, ring }) => (
        <>
          <group rotation={[0, -0.22, 0]}>
            <InkedMesh color={PALETTE.silver} geometry={envelopeGeometry} paint={0.2} position={[0, 0.01, 0]} rim={0} rimBoost={rimBoost} ring={ring} />
            <InkedMesh
              color={PALETTE.paleGold}
              geometry={flapGeometry}
              outline={0}
              paint={0.2}
              position={[0, 0.022, -ENVELOPE_DEPTH / 2 + 0.005]}
              rim={0}
              rotation={[-QUARTER_TURN, 0, 0]}
            />
            <InkedMesh color={PALETTE.ember} geometry={sealGeometry} outline={0.006} paint={0.1} position={[0, 0.034, 0.06]} />
          </group>

          <group position={[-0.26, 0, -0.45]}>
            <InkedMesh color={PALETTE.indigo} geometry={wellGeometry} position={[0, 0.085, 0]} rimBoost={rimBoost} ring={ring} />
            <InkedMesh color={PALETTE.indigo} geometry={neckGeometry} outline={0.008} position={[0, 0.2, 0]} />
            <InkedMesh
              color={PALETTE.silver}
              geometry={featherGeometry}
              outline={0.007}
              paint={0.15}
              position={[0, 0.16, 0]}
              rimBoost={rimBoost}
              rotation={[0.1, 0.5, -0.3]}
            />
          </group>
        </>
      )}
    </DeskObject>
  )
}
