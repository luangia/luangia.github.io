import { BlendFunction, Effect } from 'postprocessing'
import { Uniform, Vector2 } from 'three'
import { noiseGlsl } from './noise.glsl'

const fragmentShader = /* glsl */ `
  uniform float uDim;
  uniform vec2 uFocusCenter;

  ${noiseGlsl}

  void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
    vec3 color = inputColor.rgb;
    vec2 centered = (uv - 0.5) * vec2(aspect, 1.0);

    // Vignette, tinted indigo so the corners sink rather than turn grey.
    float vignette = smoothstep(0.42, 1.05, length(centered));
    color = mix(color, color * vec3(0.26, 0.24, 0.48), vignette);

    // During a close-up, everything outside the object falls back.
    vec2 fromFocus = (uv - uFocusCenter) * vec2(aspect, 1.0);
    float outside = smoothstep(0.38, 0.72, length(fromFocus));
    color = mix(color, color * vec3(0.34, 0.32, 0.56), uDim * outside);

    // Paper tooth plus long fibres, fixed to the screen like the sheet itself.
    vec2 pixel = uv * resolution / min(resolution.x / 1280.0, 2.0);
    float tooth = fbm(vec3(pixel * 0.55, 1.0));
    float fibres = noise(vec3(pixel.x * 0.05, pixel.y * 0.9, 3.0));
    color *= 1.0 + (tooth - 0.5) * 0.3 + (fibres - 0.5) * 0.1;

    outputColor = vec4(color, inputColor.a);
  }
`

/** Unifies the 3D layers: paper grain, vignette, and the close-up dim. */
export class PaperEffect extends Effect {
  constructor() {
    super('PaperEffect', fragmentShader, {
      blendFunction: BlendFunction.NORMAL,
      uniforms: new Map<string, Uniform<number | Vector2>>([
        ['uDim', new Uniform(0)],
        ['uFocusCenter', new Uniform(new Vector2(0.33, 0.42))],
      ]),
    })
  }

  get dim() {
    return this.uniforms.get('uDim') as Uniform<number>
  }
}
