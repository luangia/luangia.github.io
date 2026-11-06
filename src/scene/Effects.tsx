import { Bloom, EffectComposer } from '@react-three/postprocessing'

/**
 * Bloom is selective by brightness: toon surfaces stay below 1, while the moon,
 * screen and flame render above it, so only they glow.
 */
export function Effects() {
  return (
    <EffectComposer multisampling={4}>
      <Bloom intensity={0.75} luminanceSmoothing={0.2} luminanceThreshold={1} mipmapBlur radius={0.7} />
    </EffectComposer>
  )
}
