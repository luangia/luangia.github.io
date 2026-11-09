import { createContext } from 'react'
import { Vector4 } from 'three'
import { SECTIONS, type SectionId } from '../../state/store'

/**
 * Areas of the print that each have their own passage: the room (desk, window,
 * sky) and one per desk object. A region's index is its ID in the region pass.
 */
export const TEXT_REGIONS = ['room', ...SECTIONS] as const

export type TextRegion = 'room' | SectionId

/** Layer for meshes that render into the region pass. */
export const TEXT_REGION_LAYER = 1

/**
 * Each region's on-screen box, in device pixels from the top left, as
 * (x, y, width, height). Its passage is laid out from that corner.
 */
export const regionBoxes = TEXT_REGIONS.map(() => new Vector4())

/** Set to 1 while the region pass renders, so materials output region IDs. */
export const regionPass = { value: 0 }

/** The text region that meshes below it belong to. */
export const TextRegionContext = createContext(0)

export function regionIndex(region: TextRegion) {
  return TEXT_REGIONS.indexOf(region)
}
