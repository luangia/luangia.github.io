import { Color, ShaderMaterial, Vector2 } from 'three'
import { PALETTE } from '../config'
import { noiseGlsl } from './noise.glsl'

/** Values above 1 in these shaders are what the bloom pass picks up. */

export function createScreenMaterial(width: number, height: number) {
  const lit = (color: string, brightness = 1) => ({
    value: new Color(color).multiplyScalar(brightness),
  })

  return new ShaderMaterial({
    uniforms: {
      uSize: { value: new Vector2(width, height) },
      uDesktop: lit(PALETTE.screen),
      uInk: lit(PALETTE.ink),
      uSilver: lit(PALETTE.silver, 1.1),
      uCream: lit(PALETTE.paleGold, 1.15),
      uViolet: lit(PALETTE.violet, 1.6),
      uEmber: lit(PALETTE.ember, 1.1),
      uGreen: lit(PALETTE.verdigris, 1.1),
      uGold: lit(PALETTE.gold, 1.1),
    },
    vertexShader: /* glsl */ `
      varying vec2 vUv;

      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec2 uSize;
      uniform vec3 uDesktop;
      uniform vec3 uInk;
      uniform vec3 uSilver;
      uniform vec3 uCream;
      uniform vec3 uViolet;
      uniform vec3 uEmber;
      uniform vec3 uGreen;
      uniform vec3 uGold;

      varying vec2 vUv;

      float roundedBox(vec2 point, vec2 center, vec2 halfSize, float radius) {
        vec2 edge = abs(point - center) - halfSize + radius;
        return length(max(edge, 0.0)) + min(max(edge.x, edge.y), 0.0) - radius;
      }

      float fill(float signedDistance) {
        float width = fwidth(signedDistance);
        return 1.0 - smoothstep(-width, width, signedDistance);
      }

      void drawWindow(inout vec3 color, vec2 point, vec2 center, vec2 halfSize, vec3 body, vec3 bar) {
        const float BAR_HEIGHT = 0.075;
        const float INK_WIDTH = 0.011;

        float box = roundedBox(point, center, halfSize, 0.022);
        vec3 surface = mix(body, bar, step(center.y + halfSize.y - BAR_HEIGHT, point.y));

        color = mix(color, uInk, fill(box - INK_WIDTH));
        color = mix(color, surface, fill(box));
      }

      void main() {
        vec2 point = (vUv - 0.5) * uSize;
        vec3 color = uDesktop;

        // Back to front, so each window overlaps the one before it.
        drawWindow(color, point, vec2(-0.29, 0.13), vec2(0.34, 0.25), uSilver, uEmber);
        drawWindow(color, point, vec2(0.3, 0.17), vec2(0.3, 0.2), uViolet, uGreen);
        drawWindow(color, point, vec2(0.05, -0.15), vec2(0.34, 0.22), uCream, uGold);

        gl_FragColor = vec4(color, 1.0);
        #include <colorspace_fragment>
      }
    `,
  })
}

export function createSkyMaterial(moonCenter: Vector2, moonRadius: number) {
  return new ShaderMaterial({
    uniforms: {
      uMoonCenter: { value: moonCenter },
      uMoonRadius: { value: moonRadius },
    },
    vertexShader: /* glsl */ `
      varying vec3 vWorldPosition;

      void main() {
        vec4 world = modelMatrix * vec4(position, 1.0);
        vWorldPosition = world.xyz;
        gl_Position = projectionMatrix * viewMatrix * world;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec2 uMoonCenter;
      uniform float uMoonRadius;

      varying vec3 vWorldPosition;

      ${noiseGlsl}

      void main() {
        vec2 point = vWorldPosition.xy;
        float fromMoon = distance(point, uMoonCenter);

        // Banded night sky that brightens around the moon.
        float glow = smoothstep(2.6, 0.2, fromMoon + (fbm(vec3(point * 1.6, 2.0)) - 0.5) * 0.7);
        vec3 color = mix(vec3(0.012, 0.012, 0.06), vec3(0.09, 0.075, 0.27), floor(glow * 4.0) / 3.0);

        // Stepped brush-edged clouds.
        float clouds = fbm(vec3(point.x * 0.9, point.y * 2.6, 4.0));
        color = mix(color, vec3(0.2, 0.17, 0.42), step(0.6, clouds) * 0.8);

        // The disc outshines the bloom threshold; darker maria are painted in.
        float maria = fbm(vec3(point * 3.2, 7.0));
        vec3 disc = mix(vec3(2.1, 2.05, 1.75), vec3(1.15, 1.2, 1.45), step(0.56, maria));
        color = mix(color, disc, smoothstep(uMoonRadius + 0.012, uMoonRadius - 0.012, fromMoon));

        gl_FragColor = vec4(color, 1.0);
        #include <colorspace_fragment>
      }
    `,
  })
}
