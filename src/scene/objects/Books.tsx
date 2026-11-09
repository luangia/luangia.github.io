import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'
import { BoxGeometry } from 'three'
import { PALETTE } from '../config'
import { InkedMesh } from '../InkedMesh'
import { DeskObject, type ObjectEffects } from './DeskObject'

const BOARD_THICKNESS = 0.018

type StackedBookProps = ObjectEffects & {
  width: number
  depth: number
  height: number
  color: string
  y: number
  x: number
  turn: number
}

function createBookGeometry(width: number, depth: number, height: number) {
  return {
    board: new RoundedBoxGeometry(width, BOARD_THICKNESS, depth, 2, 0.008),
    pages: new BoxGeometry(width - 0.07, height - BOARD_THICKNESS * 2, depth - 0.05),
    spine: new RoundedBoxGeometry(0.03, height, depth, 2, 0.012),
  }
}

const STACK = [
  { width: 1.02, depth: 0.76, height: 0.15, color: PALETTE.violet, x: 0, turn: 0.06 },
  { width: 0.94, depth: 0.7, height: 0.12, color: PALETTE.moss, x: 0.04, turn: -0.12 },
  { width: 0.98, depth: 0.72, height: 0.14, color: PALETTE.wood, x: -0.03, turn: 0.2 },
  { width: 0.82, depth: 0.62, height: 0.1, color: PALETTE.indigo, x: 0.02, turn: -0.05 },
].map((book, index, books) => ({
  ...book,
  y: books.slice(0, index).reduce((sum, below) => sum + below.height + 0.012, 0),
  geometry: createBookGeometry(book.width, book.depth, book.height),
}))


function StackedBook({ width, height, color, x, y, turn, geometry, rimBoost, ring }: StackedBookProps & {
  geometry: ReturnType<typeof createBookGeometry>
}) {
  return (
    <group position={[x, y, 0]} rotation={[0, turn, 0]}>
      <InkedMesh color={color} geometry={geometry.board} position={[0, BOARD_THICKNESS / 2, 0]} rimBoost={rimBoost} ring={ring} />
      <InkedMesh
        color={PALETTE.paleGold}
        geometry={geometry.pages}
        outline={0.005}
        paint={0.2}
        position={[0.01, height / 2, 0]}
        rim={0}
      />
      <InkedMesh color={color} geometry={geometry.board} position={[0, height - BOARD_THICKNESS / 2, 0]} rimBoost={rimBoost} ring={ring} />
      <InkedMesh color={color} geometry={geometry.spine} outline={0.006} position={[-width / 2 + 0.012, height / 2, 0]} rim={0} />
    </group>
  )
}

const coverGeometry = new RoundedBoxGeometry(1.22, 0.03, 0.8, 2, 0.012)
const leafGeometry = new BoxGeometry(0.58, 0.05, 0.72)
const OPEN_PAGE_TILT = 0.07

export function Books() {
  return (
    <DeskObject
      hitArea={{ position: [0, 0.28, 0.08], size: [1.3, 0.85, 2.35] }}
      id="reading"
      labelHeight={0.95}
    >
      {({ rimBoost, ring }) => (
        <>
          <group position={[-0.12, 0, -0.62]} rotation={[0, 0.1, 0]}>
            {STACK.map((book) => (
              <StackedBook key={book.color} {...book} rimBoost={rimBoost} ring={ring} />
            ))}
          </group>

          <group position={[0.1, 0, 0.72]} rotation={[0, -0.1, 0]}>
            <InkedMesh color={PALETTE.violet} geometry={coverGeometry} position={[0, 0.015, 0]} rimBoost={rimBoost} ring={ring} />
            <InkedMesh
              color={PALETTE.paleGold}
              geometry={leafGeometry}
              outline={0.008}
              paint={0.2}
              position={[-0.295, 0.064, 0]}
              rim={0}
              rotation={[0, 0, -OPEN_PAGE_TILT]}
            />
            <InkedMesh
              color={PALETTE.paleGold}
              geometry={leafGeometry}
              outline={0.008}
              paint={0.2}
              position={[0.295, 0.064, 0]}
              rim={0}
              rotation={[0, 0, OPEN_PAGE_TILT]}
            />
          </group>
        </>
      )}
    </DeskObject>
  )
}

