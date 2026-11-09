import { lazy, Suspense } from 'react'
import { site } from './content'
import { useDeskStore } from './state/store'
import { SimpleView } from './ui/SimpleView'
import { canRenderDesk } from './webgl'
import { loadTypeFont } from './fonts'

// The print bakes its passages into a glyph atlas once, so the font has to be
// ready before the desk loads.
const DeskView = lazy(() => Promise.all([import('./DeskView'), loadTypeFont()]).then(([view]) => view))
const canShowDesk = canRenderDesk()

export function App() {
  const simple = useDeskStore((state) => state.simple)

  if (simple || !canShowDesk) return <SimpleView canShowDesk={canShowDesk} />

  return (
    <Suspense fallback={<p className="loading">{site.ui.loading}</p>}>
      <DeskView />
    </Suspense>
  )
}
