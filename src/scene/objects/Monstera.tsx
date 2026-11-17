import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import {
  BufferGeometry,
  CatmullRomCurve3,
  CylinderGeometry,
  Float32BufferAttribute,
  Path,
  Shape,
  ShapeGeometry,
    TubeGeometry,
  Vector3,
  type Group,
} from 'three'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { PALETTE } from '../config'
import { InkedMesh } from '../InkedMesh'
import { DeskObject } from './DeskObject'

/** The plant and pot are modeled in their own units, then scaled down to sit on the desk. */
const PLANT_SCALE = 0.62
const LEAF_THICKNESS = 0.02
/** Where the stems leave the soil, which fills the pot to its rim. */
const SOIL_HEIGHT = 0.9
/** Where each stem ends and its leaf attaches, in plant units. */
const STEM_TIP = new Vector3(0, 1.25, 0.35)
/** How far each leaf leans out over its stem, in radians: upright enough to read from the seat. */
const LEAF_LEAN = 0.55

/**
 * A low-poly monstera leaf in the xy plane: base at the origin, tip up the y
 * axis, two angular split notches on each side and four faceted holes.
 */
function createLeafShape() {
  const shape = new Shape()
  shape.moveTo(0, 0)

  // Left side, with two split notches.
  shape.lineTo(-0.45, 0.15)
  shape.lineTo(-0.85, 0.65)
  shape.lineTo(-0.35, 0.85)
  shape.lineTo(-0.95, 1.05)
  shape.lineTo(-0.85, 1.55)
  shape.lineTo(-0.3, 1.65)
  shape.lineTo(-0.7, 1.85)
  shape.lineTo(0, 2.45)

  // Right side, mirrored.
  shape.lineTo(0.7, 1.85)
  shape.lineTo(0.3, 1.65)
  shape.lineTo(0.85, 1.55)
  shape.lineTo(0.95, 1.05)
  shape.lineTo(0.35, 0.85)
  shape.lineTo(0.85, 0.65)
  shape.lineTo(0.45, 0.15)
  shape.closePath()

  const holes: [number, number, number, number, number][] = [
    [-0.28, 1.25, 0.08, 0.18, 0.2],
    [0.28, 1.25, 0.08, 0.18, -0.2],
    [-0.22, 0.55, 0.07, 0.15, 0.3],
    [0.22, 0.55, 0.07, 0.15, -0.3],
  ]
  for (const [x, y, radiusX, radiusY, rotation] of holes) {
    const hole = new Path()
    hole.absellipse(x, y, radiusX, radiusY, 0, Math.PI * 2, false, rotation)
    shape.holes.push(hole)
  }

  return shape
}

/**
 * The leaf droops toward its tip and falls away at the sides. The leaf leans
 * forward with its face down toward the stem, so drooping is toward +z.
 */
const droop = (x: number, y: number) => 0.14 * y * y + 0.12 * Math.abs(x)

/**
 * The bent leaf as a thin slab, so the ink outline can wrap it from either
 * side: a front face, a back face and walls along every edge, all with flat
 * normals so each triangle prints as its own facet.
 */
function createLeafGeometry(shape: Shape) {
  // Few curve segments keep the holes angular.
  const flat = new ShapeGeometry(shape, 4)
  const source = flat.getAttribute('position')
  const triangles = Array.from(flat.getIndex()?.array ?? [])
  flat.dispose()

  const front: Vector3[] = []
  for (let index = 0; index < source.count; index++) {
    const x = source.getX(index)
    const y = source.getY(index)
    front.push(new Vector3(x, y, droop(x, y) + LEAF_THICKNESS / 2))
  }
  const back = front.map((point) => point.clone().setZ(point.z - LEAF_THICKNESS))

  const positions: number[] = []
  const triangle = (a: Vector3, b: Vector3, c: Vector3) => positions.push(...a.toArray(), ...b.toArray(), ...c.toArray())

  // Faces: the front as triangulated, the back wound the other way.
  const edgeUse = new Map<string, [number, number] | null>()
  for (let index = 0; index < triangles.length; index += 3) {
    const corners = triangles.slice(index, index + 3)
    const [a, b, c] = corners
    triangle(front[a], front[b], front[c])
    triangle(back[c], back[b], back[a])
    for (let corner = 0; corner < 3; corner++) {
      const from = corners[corner]
      const to = corners[(corner + 1) % 3]
      const key = from < to ? `${from}:${to}` : `${to}:${from}`
      edgeUse.set(key, edgeUse.has(key) ? null : [from, to])
    }
  }

  // Walls along the outline and the holes: every edge only one triangle uses.
  for (const edge of edgeUse.values()) {
    if (!edge) continue
    const [a, b] = edge
    triangle(front[a], back[b], front[b])
    triangle(front[a], back[a], back[b])
  }

  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3))
  geometry.computeVertexNormals()
  return geometry
}

/**
 * A young leaf, before it splits: a plain, angular heart with no notches or
 * holes, a little shorter and rounder than a grown leaf.
 */
function createYoungLeafShape() {
  const shape = new Shape()
  shape.moveTo(0, 0.12)
  shape.lineTo(-0.3, -0.04)
  shape.lineTo(-0.62, 0.22)
  shape.lineTo(-0.72, 0.7)
  shape.lineTo(-0.55, 1.2)
  shape.lineTo(-0.28, 1.55)
  shape.lineTo(0, 1.85)
  shape.lineTo(0.28, 1.55)
  shape.lineTo(0.55, 1.2)
  shape.lineTo(0.72, 0.7)
  shape.lineTo(0.62, 0.22)
  shape.lineTo(0.3, -0.04)
  shape.closePath()
  return shape
}

const leafGeometry = createLeafGeometry(createLeafShape())
const youngLeafGeometry = createLeafGeometry(createYoungLeafShape())


/** Flat normals, so each face prints as its own facet. */
function faceted(geometry: BufferGeometry) {
  const flat = geometry.toNonIndexed()
  flat.computeVertexNormals()
  geometry.dispose()
  return flat
}

// A low-poly terracotta pot: seven-sided and tapered, with a lip and soil.
const POT_SIDES = 7
const potGeometry = faceted(new CylinderGeometry(0.68, 0.48, 0.9, POT_SIDES))
const rimGeometry = faceted(new CylinderGeometry(0.74, 0.72, 0.14, POT_SIDES))
const soilGeometry = faceted(new CylinderGeometry(0.68, 0.68, 0.08, POT_SIDES))

/** A low-poly stem that curves up and out to where its leaf attaches. */
const stemGeometry = faceted(
  new TubeGeometry(new CatmullRomCurve3([new Vector3(0, 0, 0), new Vector3(0, 0.65, 0.12), STEM_TIP]), 6, 0.035, 5, false),
)

type LeafSpec = {
  /** Where the stem leaves the soil, in plant units. */
  position: [number, number, number]
  /** Lean out, turn round the plant, and tilt sideways, in radians. A turn of 0 faces the room. */
  rotation: [number, number, number]
  scale: number
  color: string
  /** Offsets each leaf's sway so they don't move together. */
  phase: number
  /** A small, unsplit leaf near the base. */
  young?: boolean
}

/** Leaves spread round the plant about a golden angle apart, in varied sizes and greens. */
const LEAVES: LeafSpec[] = [
  { position: [0, 0, 0], rotation: [0.15, 0, 0.1], scale: 0.85, color: PALETTE.leaf, phase: 0 },
  { position: [0.05, 0, -0.04], rotation: [0.22, 2.4, -0.15], scale: 0.95, color: PALETTE.leafMid, phase: 1.2 },
  { position: [-0.05, 0, 0.03], rotation: [0.18, 4.8, 0.12], scale: 0.75, color: PALETTE.leafLight, phase: 2.5 },
  { position: [0.02, -0.03, 0.05], rotation: [0.35, 1.1, -0.2], scale: 0.65, color: PALETTE.leafDeep, phase: 3.7 },
  { position: [-0.03, -0.03, -0.05], rotation: [0.32, 3.6, 0.18], scale: 0.7, color: PALETTE.leaf, phase: 4.9 },
  // Young, unsplit leaves low around the base, on short stems.
  { position: [0.1, 0, 0.1], rotation: [0.75, 0.75, -0.25], scale: 0.46, color: PALETTE.leafLight, phase: 0.6, young: true },
  { position: [-0.1, 0, 0.08], rotation: [0.8, -0.65, 0.25], scale: 0.42, color: PALETTE.leafMid, phase: 2.1, young: true },
  { position: [0.02, 0, 0.14], rotation: [0.85, 0.05, 0.05], scale: 0.36, color: PALETTE.leafLight, phase: 4.2, young: true },
]

/** Now: a monstera in a terracotta pot. Its leaves sway a little unless motion is reduced. */
export function Monstera() {
  const leaves = useRef<(Group | null)[]>([])
  const reducedMotion = useReducedMotion()

  useFrame(({ clock }) => {
    if (reducedMotion) return
    const time = clock.elapsedTime
    leaves.current.forEach((leaf, index) => {
      if (!leaf) return
      const { rotation, phase } = LEAVES[index]
      leaf.rotation.x = rotation[0] + Math.sin(time * 1.4 + phase) * 0.03
      leaf.rotation.z = rotation[2] + Math.cos(time * 1.1 + phase) * 0.025
    })
  })

  return (
    <DeskObject
      hitArea={{ position: [0, 1.05, 0], size: [2.2, 2.1, 1.8] }}
      id="now"
      labelHeight={2.1}
    >
      {({ rimBoost, ring }) => (
        <>
          <group scale={PLANT_SCALE}>
            <InkedMesh color={PALETTE.terracotta} geometry={potGeometry} paint={0.5} position={[0, 0.45, 0]} rimBoost={rimBoost} ring={ring} />
            <InkedMesh color={PALETTE.terracottaRim} geometry={rimGeometry} paint={0.5} position={[0, 0.86, 0]} rimBoost={rimBoost} ring={ring} />
            <InkedMesh color={PALETTE.soil} geometry={soilGeometry} outline={0.005} position={[0, 0.9, 0]} rim={0} />
          </group>

          <group position={[0, SOIL_HEIGHT * PLANT_SCALE, 0]} scale={PLANT_SCALE}>
            {LEAVES.map(({ position, rotation, scale, color, young }, index) => (
              <group
                key={`leaf-${index}`}
                position={position}
                ref={(leaf) => {
                  leaves.current[index] = leaf
                }}
                rotation={rotation}
                scale={scale}
              >
                <InkedMesh color={PALETTE.stem} geometry={stemGeometry} outline={0.006} />
                <InkedMesh
                  color={color}
                  geometry={young ? youngLeafGeometry : leafGeometry}
                  outline={0.012}
                  paint={0.35}
                  position={STEM_TIP.toArray()}
                  rimBoost={rimBoost}
                  ring={ring}
                  rotation={[LEAF_LEAN, 0, 0]}
                />
              </group>
            ))}
          </group>
        </>
      )}
    </DeskObject>
  )
}
