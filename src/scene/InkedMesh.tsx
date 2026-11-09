import type { ThreeElements } from '@react-three/fiber'
import { useContext, useEffect, useMemo } from 'react'
import type { BufferGeometry, Object3D } from 'three'
import { addOutlineNormals, createOutlineMaterial } from './materials/outline'
import { createToonMaterial, type SharedFloat } from './materials/toon'
import { TEXT_REGION_LAYER, TextRegionContext } from './print/regions'

type InkedMeshProps = Omit<ThreeElements['group'], 'children'> & {
  geometry: BufferGeometry
  color: string
  /** Second color, painted in irregular patches. */
  patch?: string
  /** Ink line width in world units; 0 leaves the mesh unlined. */
  outline?: number
  /** Strength of the painted brush-stroke tint. */
  paint?: number
  /**
   * Strength of the moon rim. Use 0 on large flat surfaces, which fill with rim
   * light when seen at a grazing angle.
   */
  rim?: number
  /** Skip light and shade, for backdrop surfaces. */
  flat?: boolean
  /** Shared 0–1 uniform that brightens the rim light. */
  rimBoost?: SharedFloat
  /** Shared 0–1 uniform that turns the ink line into the keyboard focus ring. */
  ring?: SharedFloat
}

const noRimBoost: SharedFloat = { value: 0 }
const noRing: SharedFloat = { value: 0 }

/** Also draws the mesh in the region pass, which decides each area's passage. */
const joinRegionPass = (mesh: Object3D) => mesh.layers.enable(TEXT_REGION_LAYER)

/** A mesh with toon shading and, by default, an inverted-hull ink outline. */
export function InkedMesh({
  geometry,
  color,
  patch,
  outline = 0.012,
  paint = 0.35,
  rim = 1,
  flat = false,
  rimBoost = noRimBoost,
  ring = noRing,
  ...groupProps
}: InkedMeshProps) {
  const region = useContext(TextRegionContext)
  const toon = useMemo(
    () => createToonMaterial({ color, patch, paint, rim, flat, rimBoost, region }),
    [color, patch, paint, rim, flat, rimBoost, region],
  )
  const hull = useMemo(
    () => (outline > 0 ? createOutlineMaterial(outline, ring, region) : null),
    [outline, ring, region],
  )
  const hullGeometry = useMemo(
    () => (outline > 0 ? addOutlineNormals(geometry) : null),
    [geometry, outline],
  )

  useEffect(() => () => toon.dispose(), [toon])
  useEffect(() => () => hull?.dispose(), [hull])

  return (
    <group {...groupProps}>
      <mesh geometry={geometry} material={toon} onUpdate={joinRegionPass} />
      {hull && hullGeometry && (
        <mesh geometry={hullGeometry} material={hull} raycast={() => null} onUpdate={joinRegionPass} />
      )}
    </group>
  )
}
