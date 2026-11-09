import { CanvasTexture, DataTexture, LinearFilter, LinearMipmapLinearFilter, NearestFilter, RedFormat } from 'three'
import { passages } from '../../content'

const ATLAS_COLUMNS = 16
const TILE_WIDTH = 36
const TILE_HEIGHT = 60
const STREAM_WIDTH = 256
/** Gap between passages in the running text. */
const PASSAGE_BREAK = '   '

/** All passages as one line of running text, in reading order. */
function buildStream() {
  return passages.map((passage) => passage.text.replace(/\s+/g, ' ')).join(PASSAGE_BREAK) + PASSAGE_BREAK
}

/**
 * Draws every character once into an atlas. Glyphs are softened slightly so
 * the print pass can threshold them thinner or bolder to match the tone.
 */
function buildAtlas(characters: string[]) {
  const rows = Math.ceil(characters.length / ATLAS_COLUMNS)
  const canvas = document.createElement('canvas')
  canvas.width = ATLAS_COLUMNS * TILE_WIDTH
  canvas.height = rows * TILE_HEIGHT

  const context = canvas.getContext('2d')!
  context.fillStyle = '#000'
  context.fillRect(0, 0, canvas.width, canvas.height)
  context.fillStyle = '#fff'
  context.filter = 'blur(1.6px)'
  context.font = `600 ${TILE_HEIGHT * 0.78}px "Courier New", Courier, ui-monospace, monospace`
  context.textAlign = 'center'
  context.textBaseline = 'alphabetic'

  characters.forEach((character, index) => {
    const x = (index % ATLAS_COLUMNS) * TILE_WIDTH + TILE_WIDTH / 2
    const y = Math.floor(index / ATLAS_COLUMNS) * TILE_HEIGHT + TILE_HEIGHT * 0.76
    context.fillText(character, x, y)
  })

  const texture = new CanvasTexture(canvas)
  texture.flipY = false
  texture.minFilter = LinearMipmapLinearFilter
  texture.magFilter = LinearFilter
  return { texture, columns: ATLAS_COLUMNS, rows }
}

/** The text layer's inputs: a glyph atlas, and the passages as atlas indices. */
export function createTypeLayer() {
  const stream = buildStream()
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
    stream: { texture: streamTexture, width: STREAM_WIDTH, height, length: stream.length },
  }
}
