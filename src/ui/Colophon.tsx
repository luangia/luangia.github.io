import { Fragment } from 'react'
import { passages, site } from '../content'

type ColophonProps = {
  className?: string
  /** Author names only, with titles in each link's label. For tight spaces. */
  compact?: boolean
}

/** Credits every book the print is typeset in. */
export function Colophon({ className, compact = false }: ColophonProps) {
  return (
    <p className={className}>
      {site.ui.colophon}{' '}
      {passages.map((passage, index) => {
        const credit = `${passage.title} (${passage.author}, ${passage.year})`

        return (
          <Fragment key={passage.source}>
            {index > 0 && (index === passages.length - 1 ? ' and ' : ', ')}
            {compact ? (
              <a aria-label={credit} href={passage.source} rel="noreferrer" target="_blank" title={credit}>
                {passage.author}
              </a>
            ) : (
              <>
                <a href={passage.source} rel="noreferrer" target="_blank">
                  {passage.title}
                </a>{' '}
                ({passage.author}, {passage.year})
              </>
            )}
          </Fragment>
        )
      })}
      .
    </p>
  )
}
