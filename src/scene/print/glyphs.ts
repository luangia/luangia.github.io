import { CanvasTexture, DataTexture, LinearFilter, LinearMipmapLinearFilter, NearestFilter, RedFormat } from 'three'
import { printedPassages } from '../../typeLayer'
import { MONO_FAMILY, TYPE_WEIGHT } from '../../fonts'
import { TEXT_REGIONS } from './regions'

const ATLAS_COLUMNS = 16
/** Size the glyphs are drawn at in the atlas, in pixels. */
const FONT_SIZE = 60
const FONT = `${TYPE_WEIGHT} ${FONT_SIZE}px ${MONO_FAMILY}`
/**
 * Empty space around each tile, so the softening blur and mipmaps can't pull
 * in a neighbouring glyph now that letters fill their cells edge to edge.
 */
const GUTTER = 4
const STREAM_WIDTH = 256
/** Gap between passages in the running text. */
const PASSAGE_BREAK = '   '

/**
 * Each region's printed passages as one line of running text, all regions back
 * to back. A region with no passage of its own borrows the room's; if the room
 * has none either, its span is empty and it prints dots instead of type.
 */
function buildStream() {
  const texts = TEXT_REGIONS.map((region) =>
    printedPassages
      .filter((passage) => passage.object === region)
      .map((passage) => passage.text.replace(/\s+/g, ' ') + PASSAGE_BREAK)
      .join(''),
  )

  let stream = ''
  const spans = texts.map((text) => {
    const span = { start: stream.length, length: text.length }
    stream += text
    return span
  })

  return { stream, spans: spans.map((span) => (span.length > 0 ? span : spans[0])) }
}

/**
 * The cell each letter is set in, from the font's own metrics: Courier's real
 * advance across, and its tallest ascender to deepest descender down. Letters
 * fill their cells, so the type sets tight, with lines close together.
 */
function measureCell(characters: string[]) {
  const context = document.createElement('canvas').getContext('2d')!
  context.font = FONT

  let ascent = 0
  let descent = 0
  for (const character of characters) {
    const metrics = context.measureText(character)
    ascent = Math.max(ascent, metrics.actualBoundingBoxAscent)
    descent = Math.max(descent, metrics.actualBoundingBoxDescent)
  }

  return {
    width: Math.ceil(context.measureText('M').width),
    height: Math.ceil(ascent + descent) + 2,
    baseline: Math.ceil(ascent) + 1,
  }
}

/**
 * Draws every character once into an atlas. Glyphs are softened slightly so
 * the print pass can threshold them thinner or bolder to match the tone.
 */
function buildAtlas(characters: string[]) {
  const cell = measureCell(characters)
  const tileWidth = cell.width + GUTTER * 2
  const tileHeight = cell.height + GUTTER * 2
  const rows = Math.ceil(characters.length / ATLAS_COLUMNS)

  const canvas = document.createElement('canvas')
  canvas.width = ATLAS_COLUMNS * tileWidth
  canvas.height = rows * tileHeight

  const context = canvas.getContext('2d')!
  context.fillStyle = '#000'
  context.fillRect(0, 0, canvas.width, canvas.height)
  context.fillStyle = '#fff'
  context.filter = 'blur(1.6px)'
  context.font = FONT
  context.textAlign = 'center'
  context.textBaseline = 'alphabetic'

  characters.forEach((character, index) => {
    const x = (index % ATLAS_COLUMNS) * tileWidth + tileWidth / 2
    const y = Math.floor(index / ATLAS_COLUMNS) * tileHeight + GUTTER + cell.baseline
    context.fillText(character, x, y)
  })

  const texture = new CanvasTexture(canvas)
  texture.flipY = false
  texture.minFilter = LinearMipmapLinearFilter
  texture.magFilter = LinearFilter

  return {
    texture,
    columns: ATLAS_COLUMNS,
    rows,
    /** Width over height of a letter's cell. */
    cellAspect: cell.width / cell.height,
    /** Where the cell sits inside its tile, as a share of the tile. */
    inset: { x: GUTTER / tileWidth, y: GUTTER / tileHeight },
    scale: { x: cell.width / tileWidth, y: cell.height / tileHeight },
  }
}

/** The text layer's inputs: a glyph atlas and the passages. */
export function createTypeLayer() {
  const { stream, spans } = buildStream()
  const characters = [...new Set(stream)]
  const lookup = new Map(characters.map((character, index) => [character, index]))

  const height = Math.ceil(stream.length / STREAM_WIDTH)
  const indices = new Uint8Array(STREAM_WIDTH * height)
  ;[...stream].forEach((character, index) => {
    indices[index] = lookup.get(character)!
  })

  const streamTexture = new DataTexture(indices, STREAM_WIDTH, height, RedFormat)
  streamTexture.minFilter = NearestFilter
  streamTexture.magFilter = NearestFilter
  streamTexture.needsUpdate = true

  return {
    atlas: buildAtlas(characters),
    stream: { texture: streamTexture, width: STREAM_WIDTH, height },
    /** Where each region's text starts in the stream, and how long it runs. */
    spans,
  }
}
