const MIN_CORES = 3
const MIN_MEMORY_GB = 3

/** Sends devices without WebGL2, or with very little power, to the simple view. */
export function canRenderDesk() {
  const { deviceMemory, hardwareConcurrency } = navigator as Navigator & { deviceMemory?: number }

  if (hardwareConcurrency < MIN_CORES) return false
  if (deviceMemory !== undefined && deviceMemory < MIN_MEMORY_GB) return false

  const context = document.createElement('canvas').getContext('webgl2')
  context?.getExtension('WEBGL_lose_context')?.loseContext()
  return context !== null
}
