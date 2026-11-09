import '@fontsource/courier-prime/400.css'
import '@fontsource/courier-prime/400-italic.css'
import '@fontsource/courier-prime/700.css'

/**
 * Courier Prime sets everything: headings, body text, labels and the passages
 * printed in the scene. Self-hosted, so every visitor gets the same face.
 */
export const MONO_FAMILY = '"Courier Prime", "Courier New", Courier, ui-monospace, monospace'

/** The weight the printed passages are set in. */
export const TYPE_WEIGHT = 700

/** Resolves once the printed passages' font is ready, or fails quietly. */
export function loadTypeFont() {
  return document.fonts.load(`${TYPE_WEIGHT} 16px "Courier Prime"`).catch(() => [])
}
