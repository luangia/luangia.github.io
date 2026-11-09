import { BlendFunction, Effect, EffectAttribute } from 'postprocessing'
import { Color, Matrix3, Uniform, Vector2, Vector3, type Texture } from 'three'
import { MIN_INK_TRANSMISSION, RISO } from '../config'
import { noiseGlsl } from '../materials/noise.glsl'
import { createTypeLayer } from './glyphs'

/** Text cell size in CSS pixels; Courier's advance is about 0.6 of its height. */
const CELL_HEIGHT = 11
const CELL_WIDTH = CELL_HEIGHT * 0.6
/** Dot dither cell size in CSS pixels. */
const DOT_SIZE = 2

const fragmentShader = /* glsl */ `
  uniform sampler2D uGlyphs;
  uniform sampler2D uStream;
  uniform vec2 uAtlasGrid;
  uniform vec3 uStreamInfo;
  uniform vec2 uCell;
  uniform float uDot;
  uniform float uExposure;
  uniform mat3 uSeparate;
  uniform vec3 uPaper;
  uniform vec3 uInkBlue;
  uniform vec3 uInkPink;
  uniform vec3 uInkYellow;
  uniform vec2 uOffsetPink;
  uniform vec2 uOffsetYellow;
  uniform float uDim;
  uniform vec2 uFocusCenter;

  ${noiseGlsl}

  float bayer2(vec2 a) {
    a = floor(a);
    return fract(a.x / 2.0 + a.y * a.y * 0.75);
  }

  float bayer8(vec2 a) {
    return bayer2(0.25 * a) * 0.0625 + bayer2(0.5 * a) * 0.25 + bayer2(a);
  }

  // Outlines render pure black, which no ink mix produces; they print as key line.
  float keyLine(vec2 at) {
    vec3 color = texture2D(inputBuffer, clamp(at, 0.0, 1.0)).rgb;
    return 1.0 - smoothstep(0.0015, 0.006, max(color.r, max(color.g, color.b)));
  }

  // Ink coverage for blue, pink and yellow, separated from a rendered color.
  vec3 separate(vec2 at) {
    vec3 color = texture2D(inputBuffer, clamp(at, 0.0, 1.0)).rgb;
    vec3 printed = clamp(pow(max(color, 0.0), vec3(1.0 / 2.2)) * uExposure, 0.002, 1.0);
    return clamp(uSeparate * (log(printed) - log(uPaper)), 0.0, 1.0);
  }

  // Ordered dots, each ink on its own screen angle to avoid moire.
  float dots(float coverage, vec2 pixel, float angle) {
    vec2 turned = mat2(cos(angle), -sin(angle), sin(angle), cos(angle)) * pixel;
    return step(bayer8(turned / uDot) + 0.001, coverage);
  }

  // Misregistration: a fixed shift plus a slight turn about the page center.
  vec2 register(vec2 pixel, vec2 shift, float turn) {
    vec2 centered = pixel - resolution * 0.5;
    return pixel + shift + vec2(-centered.y, centered.x) * turn;
  }

  // Blue is set in type: each cell prints the next character of the passages,
  // thinner where the tone is light and bolder where it is dark. Tone is read
  // per pixel, so letters are cut cleanly at object edges, like a stencil.
  float typeset(vec2 pixel, float tone) {
    vec2 fromTop = vec2(pixel.x, resolution.y - pixel.y);
    vec2 cell = floor(fromTop / uCell);
    vec2 inCell = fract(fromTop / uCell);

    if (tone < 0.08) return 0.0;

    float columns = floor(resolution.x / uCell.x);
    float index = mod(cell.y * columns + cell.x, uStreamInfo.z);
    vec2 streamAt = (vec2(mod(index, uStreamInfo.x), floor(index / uStreamInfo.x)) + 0.5) / uStreamInfo.xy;
    float glyph = floor(texture2D(uStream, streamAt).r * 255.0 + 0.5);

    vec2 tile = vec2(mod(glyph, uAtlasGrid.x), floor(glyph / uAtlasGrid.x));
    float shape = texture2D(uGlyphs, (tile + inCell) / uAtlasGrid).r;

    float threshold = mix(0.8, 0.2, tone);
    float letters = smoothstep(threshold - 0.08, threshold + 0.08, shape);
    float fill = step(bayer8(pixel / uDot), (tone - 0.62) / 0.38);
    return max(letters, fill);
  }

  void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
    vec2 pixel = uv * resolution;

    vec2 pinkPixel = register(pixel, uOffsetPink, 0.0012);
    vec2 yellowPixel = register(pixel, uOffsetYellow, -0.0009);
    float pink = separate(pinkPixel / resolution).y;
    float yellow = separate(yellowPixel / resolution).z;

    // During a close-up, the rest of the print drops to lighter blue alone.
    float outside = smoothstep(0.38, 0.72, length((uv - uFocusCenter) * vec2(aspect, 1.0)));
    pink *= 1.0 - uDim * outside;
    yellow *= 1.0 - uDim * outside;

    float blue = separate(uv).x * (1.0 - 0.5 * uDim * outside);
    float blueInk = max(typeset(pixel, blue), keyLine(uv));
    float pinkInk = dots(pink, pinkPixel, 0.26);
    float yellowInk = dots(yellow, yellowPixel, 0.79);

    // Riso ink lies unevenly, and the paper has tooth and the odd speck.
    float evenness = 0.86 + 0.14 * fbm(vec3(pixel / 90.0, 4.0));
    vec3 color = uPaper * (1.0 + (fbm(vec3(pixel * 0.7, 1.0)) - 0.5) * 0.07);
    color *= mix(vec3(1.0), uInkBlue, blueInk * evenness);
    color *= mix(vec3(1.0), uInkPink, pinkInk * evenness);
    color *= mix(vec3(1.0), uInkYellow, yellowInk * evenness);
    color *= 1.0 - 0.6 * step(0.9993, hash(vec3(floor(pixel / 2.0), 9.0)));

    outputColor = vec4(pow(color, vec3(2.2)), 1.0);
  }
`

function srgb(hex: string) {
  const color = new Color(hex)
  return new Vector3(...color.convertLinearToSRGB().toArray())
}

/**
 * Ink separation assumes inks multiply over the paper (Beer-Lambert), so in
 * log space a printed color is a weighted sum of the inks.
 */
function createSeparationMatrix(inks: Vector3[]) {
  // Real inks never block a channel completely; a floor also keeps log() finite.
  const transmit = (channel: number) => Math.log(Math.max(channel, MIN_INK_TRANSMISSION))
  const columns = inks.map((ink) => new Vector3(transmit(ink.x), transmit(ink.y), transmit(ink.z)))
  const mix = new Matrix3().set(
    columns[0].x, columns[1].x, columns[2].x,
    columns[0].y, columns[1].y, columns[2].y,
    columns[0].z, columns[1].z, columns[2].z,
  )
  return mix.invert()
}

/** Prints the rendered scene as a three-ink risograph. */
export class RisoEffect extends Effect {
  private readonly textures: Texture[]

  constructor() {
    const { atlas, stream } = createTypeLayer()
    const paper = srgb(RISO.paper)
    const inks = [srgb(RISO.blue), srgb(RISO.pink), srgb(RISO.yellow)]

    super('RisoEffect', fragmentShader, {
      attributes: EffectAttribute.CONVOLUTION,
      blendFunction: BlendFunction.NORMAL,
      uniforms: new Map<string, Uniform<unknown>>([
        ['uGlyphs', new Uniform(atlas.texture)],
        ['uStream', new Uniform(stream.texture)],
        ['uAtlasGrid', new Uniform(new Vector2(atlas.columns, atlas.rows))],
        ['uStreamInfo', new Uniform(new Vector3(stream.width, stream.height, stream.length))],
        ['uCell', new Uniform(new Vector2(CELL_WIDTH, CELL_HEIGHT))],
        ['uDot', new Uniform(DOT_SIZE)],
        ['uExposure', new Uniform(1)],
        ['uSeparate', new Uniform(createSeparationMatrix(inks))],
        ['uPaper', new Uniform(paper)],
        ['uInkBlue', new Uniform(inks[0])],
        ['uInkPink', new Uniform(inks[1])],
        ['uInkYellow', new Uniform(inks[2])],
        ['uOffsetPink', new Uniform(new Vector2(1.5, -1))],
        ['uOffsetYellow', new Uniform(new Vector2(-1, 1.5))],
        ['uDim', new Uniform(0)],
        ['uFocusCenter', new Uniform(new Vector2(0.33, 0.42))],
      ]),
    })

    this.textures = [atlas.texture, stream.texture]
  }

  /** Keeps cells and offsets a constant size in CSS pixels. */
  setPixelRatio(ratio: number) {
    ;(this.uniforms.get('uCell') as Uniform<Vector2>).value.set(CELL_WIDTH * ratio, CELL_HEIGHT * ratio)
    ;(this.uniforms.get('uDot') as Uniform<number>).value = DOT_SIZE * ratio
    ;(this.uniforms.get('uOffsetPink') as Uniform<Vector2>).value.set(1.5 * ratio, -1 * ratio)
    ;(this.uniforms.get('uOffsetYellow') as Uniform<Vector2>).value.set(-1 * ratio, 1.5 * ratio)
  }

  /** Moves the close-up's clear spot to where the object is framed. */
  setFocusLayout(bottomSheet: boolean) {
    const center = (this.uniforms.get('uFocusCenter') as Uniform<Vector2>).value

    if (bottomSheet) center.set(0.5, 0.72)
    else center.set(0.33, 0.42)
  }

  get dim() {
    return this.uniforms.get('uDim') as Uniform<number>
  }

  dispose() {
    this.textures.forEach((texture) => texture.dispose())
    super.dispose()
  }
}
