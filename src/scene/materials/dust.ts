import { ShaderMaterial } from 'three'
import { DUST } from '../config'
import { lighting } from './lighting'

/** Motes drift in the vertex shader, so moving them costs no JavaScript per frame. */
export function createDustMaterial() {
  return new ShaderMaterial({
    depthWrite: false,
    transparent: true,
    uniforms: {
      uTime: { value: 0 },
      uMin: { value: DUST.min },
      uSize: { value: DUST.size },
      uMoonColor: lighting.uMoonColor,
      uMoonDir: lighting.uMoonDir,
      uShaftOrigin: { value: DUST.shaftOrigin },
    },
    vertexShader: /* glsl */ `
      attribute vec3 aOrigin;
      attribute vec3 aSeed;

      uniform float uTime;
      uniform vec3 uMin;
      uniform vec3 uSize;
      uniform vec3 uMoonColor;
      uniform vec3 uMoonDir;
      uniform vec3 uShaftOrigin;

      varying vec2 vUv;
      varying float vStrength;

      void main() {
        vec3 point = aOrigin;
        float rise = mod(aOrigin.y - uMin.y + uTime * aSeed.y, uSize.y);
        point.y = uMin.y + rise;
        point.x += sin(uTime * 0.21 + aSeed.x) * 0.3;
        point.z += cos(uTime * 0.17 + aSeed.x * 1.7) * 0.25;

        // Motes show most where the moon shaft catches them.

        vec3 fromWindow = point - uShaftOrigin;
        vec3 offAxis = fromWindow - uMoonDir * dot(fromWindow, uMoonDir);
        float shaft = smoothstep(1.7, 0.3, length(offAxis));

        // Fades at both ends of the rise, hiding the wrap back to the bottom.
        float ends = smoothstep(0.0, 0.4, rise) * smoothstep(uSize.y, uSize.y - 0.4, rise);
        vStrength = clamp(0.85 + 0.15 * shaft, 0.0, 1.0) * ends;

        vUv = uv;
        vec4 view = viewMatrix * vec4(point, 1.0);
        view.xy += position.xy * aSeed.z;
        gl_Position = projectionMatrix * view;
      }
    `,
    fragmentShader: /* glsl */ `
      varying vec2 vUv;
      varying float vStrength;

      // Motes print as solid ink specks. A half-strength mote only separates
      // into partial ink, which the dither breaks into scattered dots.
      void main() {
        float disc = smoothstep(0.5, 0.4, distance(vUv, vec2(0.5)));
        gl_FragColor = vec4(vec3(0.02, 0.02, 0.06), disc * vStrength);
        #include <colorspace_fragment>
      }
    `,
  })
}
