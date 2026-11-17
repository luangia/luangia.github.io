import { now, site } from '../../content'

export function NowSection() {
  return (
    <>
      <dl className="now-list">
        {now.items.map((item) => (
          <div className="now-row" key={item.label}>
            <dt>{item.label}</dt>
            <dd>{item.text}</dd>
          </div>
        ))}
      </dl>
      <p className="byline">
        {site.ui.updated}: {now.updated}
      </p>
    </>
  )
}
