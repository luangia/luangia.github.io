import { useEffect, useMemo } from 'react'
import {
  BoxGeometry,
  CubicBezierCurve3,
  ExtrudeGeometry,
  Path,
  Shape,
  ShapeGeometry,
  TubeGeometry,
  Vector2,
  Vector3,
} from 'three'
import { PALETTE } from './config'
import { InkedMesh } from './InkedMesh'
import { createSkyMaterial } from './materials/emissive'

const WALL_Z = -1.75
const SILL = 0.72
const SPRING = 2
const OPENING_HALF_WIDTH = 1.7
const FRAME_WIDTH = 0.2

/** Traces an arch counter-clockwise, starting at the bottom left. */
function traceArch(path: Path, halfWidth: number, bottom: number) {
  path.moveTo(-halfWidth, bottom)
  path.lineTo(halfWidth, bottom)
  path.lineTo(halfWidth, SPRING)
  path.absarc(0, SPRING, halfWidth, 0, Math.PI, false)
  path.lineTo(-halfWidth, bottom)
  return path
}

function createWallGeometry() {
  const wall = new Shape()
  wall.moveTo(-20, -6)
  wall.lineTo(20, -6)
  wall.lineTo(20, 14)
  wall.lineTo(-20, 14)
  wall.lineTo(-20, -6)
  wall.holes.push(traceArch(new Path(), OPENING_HALF_WIDTH, SILL))
  return new ShapeGeometry(wall, 48)
}

function createFrameGeometry() {
  const frame = traceArch(new Shape(), OPENING_HALF_WIDTH + FRAME_WIDTH, SILL - FRAME_WIDTH) as Shape
  frame.holes.push(traceArch(new Path(), OPENING_HALF_WIDTH, SILL))
  return new ExtrudeGeometry(frame, {
    depth: 0.14,
    bevelEnabled: true,
    bevelSize: 0.015,
    bevelThickness: 0.015,
    bevelSegments: 2,
    curveSegments: 48,
  })
}

/** Original Art Nouveau tracery: a whiplash curve rising from the window's centre. */
function createWhiplashGeometry(side: 1 | -1) {
  const curve = new CubicBezierCurve3(
    new Vector3(0, SPRING - 0.05, 0),
    new Vector3(side * 1.05, SPRING - 0.15, 0),
    new Vector3(side * 0.15, SPRING + 1.05, 0),
    new Vector3(side * 1.21, SPRING + 1.2, 0),
  )
  return new TubeGeometry(curve, 48, 0.034, 8, false)
}

const wallGeometry = createWallGeometry()
const frameGeometry = createFrameGeometry()
const mullionGeometry = new BoxGeometry(0.05, SPRING + OPENING_HALF_WIDTH - SILL, 0.05)
const transomGeometry = new BoxGeometry(OPENING_HALF_WIDTH * 2, 0.05, 0.05)
const leftWhiplash = createWhiplashGeometry(-1)
const rightWhiplash = createWhiplashGeometry(1)

export function Backdrop() {
  const sky = useMemo(() => createSkyMaterial(new Vector2(0.92, 3.1), 0.62), [])

  useEffect(() => () => sky.dispose(), [sky])

  return (
    <>
      <mesh material={sky} position={[0, 3, WALL_Z - 1.5]}>
        <planeGeometry args={[14, 12]} />
      </mesh>

      <InkedMesh
        color={PALETTE.wall}
        geometry={wallGeometry}
        outline={0}
        paint={0}
        flat
        position={[0, 0, WALL_Z]}
        rim={0}
      />
      <InkedMesh color={PALETTE.moss} geometry={frameGeometry} outline={0.016} paint={0.6} position={[0, 0, WALL_Z - 0.04]} />

      <group position={[0, 0, WALL_Z - 0.02]}>
        <InkedMesh
          color={PALETTE.wall}
          geometry={mullionGeometry}
          position={[0, (SPRING + OPENING_HALF_WIDTH + SILL) / 2, 0]}
        />
        <InkedMesh color={PALETTE.wall} geometry={transomGeometry} position={[0, SPRING - 0.05, 0]} />
        <InkedMesh color={PALETTE.wall} geometry={leftWhiplash} outline={0.01} />
        <InkedMesh color={PALETTE.wall} geometry={rightWhiplash} outline={0.01} />
      </group>
    </>
  )
}
