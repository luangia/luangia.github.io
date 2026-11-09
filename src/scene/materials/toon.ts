import { Color, ShaderMaterial } from 'three'
import { PALETTE, RISO } from '../config'
import { lighting } from './lighting'
import { noiseGlsl } from './noise.glsl'

/** A uniform owned by the caller, so one value can drive several materials. */
export type SharedFloat = { value: number }

const vertexShader = /* glsl */ `
  varying vec3 vWorldPosition;
  varying vec3 vWorldNormal;

  void main() {
    vec4 world = modelMatrix * vec4(position, 1.0);
    vWorldPosition = world.xyz;
    vWorldNormal = normalize(mat3(modelMatrix) * normal);
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`

const fragmentShader = /* glsl */ `
  uniform vec3 uColor;
  uniform vec3 uShade;
  uniform vec3 uHighlight;
  uniform vec3 uPatchColor;
  uniform float uPatch;
  uniform float uPaint;
  uniform float uRim;
  uniform float uFlat;
  uniform float uRimBoost;
  uniform vec3 uScreenPos;
  uniform vec3 uScreenColor;
  uniform float uScreenIntensity;
  uniform vec3 uFillPos;
  uniform vec3 uFillColor;
  uniform float uFillIntensity;
  uniform vec3 uMoonDir;
  uniform vec3 uMoonColor;

  varying vec3 vWorldPosition;
  varying vec3 vWorldNormal;

  ${noiseGlsl}

  // A hard tone edge, antialiased to one pixel.
  float band(float value, float edge) {
    float width = fwidth(value);
    return smoothstep(edge - width, edge + width, value);
  }

  // Wrapped lambert with distance falloff, for broad pools of light.
  float pool(vec3 point, vec3 normal, vec3 source, float intensity, float falloff) {
    vec3 toLight = source - point;
    float distanceSquared = dot(toLight, toLight);
    float facing = dot(normal, toLight / sqrt(distanceSquared)) * 0.5 + 0.5;
    return facing * facing * intensity / (1.0 + falloff * distanceSquared);
  }

  void main() {
    vec3 point = vWorldPosition;
    vec3 normal = normalize(vWorldNormal);
    vec3 view = normalize(cameraPosition - point);

    // Long horizontal strokes tint the surface; broad noise bends the tone edges
    // into brushed shapes. Finer noise here reads as stains, not paint.
    float strokes = fbm(vec3(point.x * 2.2, point.y * 11.0, point.z * 11.0));
    float rough = (noise(point * 1.6) * 0.7 + noise(point * 3.4) * 0.3 - 0.5) * 0.12;
    vec3 surface = mix(uColor, uPatchColor, uPatch * step(0.47, fbm(point * 3.4)));
    vec3 base = surface * (1.0 + uPaint * (strokes - 0.5) * 1.3);

    float screen = pool(point, normal, uScreenPos, uScreenIntensity, 2.2);
    float fill = pool(point, normal, uFillPos, uFillIntensity, 0.45);
    float key = screen + fill;
    vec3 warmth = (uScreenColor * screen + uFillColor * fill) / max(key, 0.001);

    float midBand = band(key + rough, 0.2);
    float litBand = band(key + rough, 0.52);

    // uShade is a filter: the share of light the shading ink lets through.
    vec3 shadow = base * uShade;
    // Light is added, not multiplied: warm orange times a cool base turns to mud.
    vec3 mid = base * sqrt(uShade) + warmth * 0.05;
    vec3 lit = base * 1.05 + warmth * 0.15;

    vec3 color = mix(shadow, mid, midBand);
    color = mix(color, lit, litBand);

    // Moonlight is a cool fill on the shadow side, then a fresnel edge.
    float moonFacing = dot(normal, uMoonDir);
    color += uMoonColor * base * 0.2 * band(moonFacing + rough, 0.25) * (1.0 - midBand);

    float fresnel = pow(1.0 - max(dot(normal, view), 0.0), 4.0);
    float rimMask = smoothstep(-0.4, 0.3, moonFacing);
    float rim = band(fresnel * rimMask + rough * 0.25, mix(0.42, 0.16, uRimBoost));
    color = mix(color, uMoonColor, uRim * rim * 0.55);

    // Backdrop surfaces skip shading, so the foreground stands out against them.
    color = mix(color, base, uFlat);

    // Hover overprints the object in the highlight ink.
    color *= mix(vec3(1.0), uHighlight, uRimBoost * 0.85);

    // Everything below the desk fades to bare paper, whatever the screen shape.
    color = mix(color, vec3(1.0), smoothstep(-0.75, -2.6, point.y));

    // Held below the bloom threshold so only emissive parts glow.
    gl_FragColor = vec4(min(color, vec3(0.95)), 1.0);
    #include <colorspace_fragment>
  }
`

const paper = new Color(RISO.paper)
const shadeFilter = new Color(PALETTE.shade)
shadeFilter.setRGB(shadeFilter.r / paper.r, shadeFilter.g / paper.g, shadeFilter.b / paper.b)
const highlightColor = new Color(RISO.pink)

type ToonOptions = {
  color: string
  /** Second color, painted in irregular patches. */
  patch?: string
  paint: number
  rim: number
  /** Skip light and shade, printing the base color as is. */
  flat?: boolean
  rimBoost: SharedFloat
}

export function createToonMaterial({ color, patch, paint, rim, flat = false, rimBoost }: ToonOptions) {
  return new ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      ...lighting,
      uColor: { value: new Color(color) },
      uPatchColor: { value: new Color(patch ?? color) },
      uPatch: { value: patch ? 1 : 0 },
      uShade: { value: shadeFilter },
      uHighlight: { value: highlightColor },
      uPaint: { value: paint },
      uRim: { value: rim },
      uFlat: { value: flat ? 1 : 0 },
      uRimBoost: rimBoost,
    },
  })
}
