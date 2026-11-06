import { ShaderMaterial, Vector2 } from 'three'
import { noiseGlsl } from './noise.glsl'

/** Values above 1 in these shaders are what the bloom pass picks up. */

export function createScreenMaterial() {
  return new ShaderMaterial({
    vertexShader: /* glsl */ `
      varying vec2 vUv;

      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      varying vec2 vUv;

      void main() {
        vec3 low = vec3(0.1, 0.1, 0.42);
        vec3 high = vec3(0.62, 0.62, 1.25);
        vec3 color = mix(low, high, smoothstep(0.0, 1.0, vUv.y));

        // Painted hint of a title bar and two project cards.
        float bar = step(0.88, vUv.y);
        float cards = step(0.1, vUv.x) * step(vUv.x, 0.9) *
          (step(0.5, vUv.y) * step(vUv.y, 0.78) + step(0.14, vUv.y) * step(vUv.y, 0.42));
        color = mix(color, vec3(1.08, 0.92, 0.58), bar);
        color = mix(color, vec3(0.24, 0.2, 0.55), cards * 0.75);

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
