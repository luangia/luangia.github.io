import { Html, useCursor } from '@react-three/drei'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import { easing } from 'maath'
import { useMemo, useRef, useState, type ReactNode } from 'react'
import { Vector3, type Group } from 'three'
import { site } from '../../content'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { useDeskStore, type SectionId } from '../../state/store'
import { OBJECT_HOVER, OBJECTS } from '../config'
import type { SharedFloat } from '../materials/toon'
import { TextRegionContext, regionBoxes, regionIndex } from '../print/regions'

export type ObjectEffects = {
  rimBoost: SharedFloat
  ring: SharedFloat
}

type DeskObjectProps = {
  id: SectionId
  /** Invisible click and hover box, relative to the object's position. */
  hitArea: {
    position: [number, number, number]
    size: [number, number, number]
  }
  labelHeight: number
  children: (effects: ObjectEffects) => ReactNode
}

/** The eight corners of a hit area, in the object's own space. */
function getBoxCorners({ position, size }: DeskObjectProps['hitArea']) {
  return [-0.5, 0.5].flatMap((x) =>
    [-0.5, 0.5].flatMap((y) =>
      [-0.5, 0.5].map(
        (z) => new Vector3(position[0] + x * size[0], position[1] + y * size[1], position[2] + z * size[2]),
      ),
    ),
  )
}

/** Gives a desk model its hover, label, focus ring and click behaviour. */
export function DeskObject({ id, hitArea, labelHeight, children }: DeskObjectProps) {
  const focused = useDeskStore((state) => state.focused)
  const focus = useDeskStore((state) => state.focus)
  const returnToDesk = useDeskStore((state) => state.returnToDesk)
  const keyboardFocused = useDeskStore((state) => state.keyboardTarget === id)
  const [hovered, setHovered] = useState(false)
  const reducedMotion = useReducedMotion()
  const active = (hovered || keyboardFocused) && focused === null
  const showRing = keyboardFocused && focused === null
  const lifted = useRef<Group>(null!)
  const placed = useRef<Group>(null!)
  const region = regionIndex(id)
  const corners = useMemo(() => getBoxCorners(hitArea), [hitArea])
  const projected = useMemo(() => new Vector3(), [])
  const effects = useMemo<ObjectEffects>(() => ({ rimBoost: { value: 0 }, ring: { value: 0 } }), [])

  useCursor(hovered && focused === null)

  useFrame(({ camera, gl, size }, delta) => {
    const smoothTime = reducedMotion ? 0 : OBJECT_HOVER.smoothTime

    // The object's passage is laid out from the top left of its on-screen box.
    const ratio = gl.getPixelRatio()
    let left = Infinity
    let top = Infinity
    let right = -Infinity
    let bottom = -Infinity

    for (const corner of corners) {
      projected.copy(corner).applyMatrix4(placed.current.matrixWorld).project(camera)
      const x = ((projected.x + 1) / 2) * size.width * ratio
      const y = ((1 - projected.y) / 2) * size.height * ratio
      left = Math.min(left, x)
      right = Math.max(right, x)
      top = Math.min(top, y)
      bottom = Math.max(bottom, y)
    }

    regionBoxes[region].set(left, top, right - left, bottom - top)

    easing.damp(lifted.current.position, 'y', active && !reducedMotion ? OBJECT_HOVER.lift : 0, smoothTime, delta)
    easing.damp(effects.rimBoost, 'value', active ? 1 : 0, smoothTime, delta)
    easing.damp(effects.ring, 'value', showRing ? 1 : 0, smoothTime, delta)
  })

  const handleOver = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation()
    setHovered(true)
  }

  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation()

    // While a panel is open, everything outside it counts as "outside".
    if (focused === null) focus(id)
    else returnToDesk()
  }

  return (
    <group position={OBJECTS[id].position} ref={placed}>
      {/* Stays put while the model lifts, so the rise can't flicker the hover off. */}
      <mesh
        position={hitArea.position}
        visible={false}
        onClick={handleClick}
        onPointerOut={() => setHovered(false)}
        onPointerOver={handleOver}
      >
        <boxGeometry args={hitArea.size} />
      </mesh>

      <group ref={lifted}>
        <TextRegionContext.Provider value={region}>{children(effects)}</TextRegionContext.Provider>

        {active && (
          <Html center position={[0, labelHeight, 0]} wrapperClass="object-label-anchor">
            <div className="object-label">{site.sections[id].label}</div>
          </Html>
        )}
      </group>
    </group>
  )
}
