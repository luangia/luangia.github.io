import type { ThreeElements } from '@react-three/fiber'
import { useEffect, useMemo } from 'react'
import type { BufferGeometry } from 'three'
import { addOutlineNormals, createOutlineMaterial } from './materials/outline'
import { createToonMaterial, type SharedFloat } from './materials/toon'

type InkedMeshProps = Omit<ThreeElements['group'], 'children'> & {
  geometry: BufferGeometry
  color: string
  /** Ink line width in world units; 0 leaves the mesh unlined. */
  outline?: number
  /** Strength of the painted brush-stroke tint. */
  paint?: number
  /**
   * Strength of the moon rim. Use 0 on large flat surfaces, which fill with rim
   * light when seen at a grazing angle.
   */
  rim?: number
  /** Shared 0–1 uniform that brightens the rim light. */
  rimBoost?: SharedFloat
  /** Shared 0–1 uniform that turns the ink line into the keyboard focus ring. */
  ring?: SharedFloat
}

const noRimBoost: SharedFloat = { value: 0 }
const noRing: SharedFloat = { value: 0 }

/** A mesh with toon shading and, by default, an inverted-hull ink outline. */
export function InkedMesh({
  geometry,
  color,
  outline = 0.012,
  paint = 0.35,
  rim = 1,
  rimBoost = noRimBoost,
  ring = noRing,
  ...groupProps
}: InkedMeshProps) {
  const toon = useMemo(
    () => createToonMaterial({ color, paint, rim, rimBoost }),
    [color, paint, rim, rimBoost],
  )
  const hull = useMemo(
    () => (outline > 0 ? createOutlineMaterial(outline, ring) : null),
    [outline, ring],
  )
  const hullGeometry = useMemo(
    () => (outline > 0 ? addOutlineNormals(geometry) : null),
    [geometry, outline],
  )

  useEffect(() => () => toon.dispose(), [toon])
  useEffect(() => () => hull?.dispose(), [hull])

  return (
    <group {...groupProps}>
      <mesh geometry={geometry} material={toon} />
      {hull && hullGeometry && <mesh geometry={hullGeometry} material={hull} raycast={() => null} />}
    </group>
  )
}
