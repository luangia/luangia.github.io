import { Fragment } from 'react'
import { passages, site } from '../content'

/** Credits every book the print is typeset in. */
export function Colophon({ className }: { className?: string }) {
  return (
    <p className={className}>
      {site.ui.colophon}{' '}
      {passages.map((passage, index) => (
        <Fragment key={passage.source}>
          {index > 0 && (index === passages.length - 1 ? ' and ' : ', ')}
          <a href={passage.source} rel="noreferrer" target="_blank">
            {passage.title}
          </a>{' '}
          ({passage.author}, {passage.year})
        </Fragment>
      ))}
      .
    </p>
  )
}
