import { lazy, Suspense } from 'react'
import { site } from './content'
import { useDeskStore } from './state/store'
import { SimpleView } from './ui/SimpleView'
import { canRenderDesk } from './webgl'

const DeskView = lazy(() => import('./DeskView'))
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
