import { AdditiveBlending, ShaderMaterial } from 'three'
import { DUST } from '../config'
import { lighting } from './lighting'

/** Motes drift in the vertex shader, so moving them costs no JavaScript per frame. */
export function createDustMaterial() {
  return new ShaderMaterial({
    blending: AdditiveBlending,
    depthWrite: false,
    transparent: true,
    uniforms: {
      uTime: { value: 0 },
      uMin: { value: DUST.min },
      uSize: { value: DUST.size },
      uCandlePos: lighting.uCandlePos,
      uCandleColor: lighting.uCandleColor,
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
      uniform vec3 uCandlePos;
      uniform vec3 uCandleColor;
      uniform vec3 uMoonColor;
      uniform vec3 uMoonDir;
      uniform vec3 uShaftOrigin;

      varying vec2 vUv;
      varying vec3 vColor;

      void main() {
        vec3 point = aOrigin;
        float rise = mod(aOrigin.y - uMin.y + uTime * aSeed.y, uSize.y);
        point.y = uMin.y + rise;
        point.x += sin(uTime * 0.21 + aSeed.x) * 0.3;
        point.z += cos(uTime * 0.17 + aSeed.x * 1.7) * 0.25;

        // Motes only show where light catches them: the candle or the moon shaft.
        vec3 fromCandle = point - uCandlePos;
        float candle = 1.0 / (1.0 + 1.4 * dot(fromCandle, fromCandle));

        vec3 fromWindow = point - uShaftOrigin;
        vec3 offAxis = fromWindow - uMoonDir * dot(fromWindow, uMoonDir);
        float shaft = smoothstep(1.7, 0.3, length(offAxis));

        // Fades at both ends of the rise, hiding the wrap back to the bottom.
        float ends = smoothstep(0.0, 0.4, rise) * smoothstep(uSize.y, uSize.y - 0.4, rise);
        vColor = (uCandleColor * candle + uMoonColor * (0.07 + 0.3 * shaft)) * ends;

        vUv = uv;
        vec4 view = viewMatrix * vec4(point, 1.0);
        view.xy += position.xy * aSeed.z;
        gl_Position = projectionMatrix * view;
      }
    `,
    fragmentShader: /* glsl */ `
      varying vec2 vUv;
      varying vec3 vColor;

      void main() {
        float disc = smoothstep(0.5, 0.12, distance(vUv, vec2(0.5)));
        gl_FragColor = vec4(vColor * disc, disc);
        #include <colorspace_fragment>
      }
    `,
  })
}
