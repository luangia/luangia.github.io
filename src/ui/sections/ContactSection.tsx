import { contact, site } from '../../content'

export function ContactSection() {
  const links = [
    contact.email && { href: `mailto:${contact.email}`, label: contact.email, name: site.ui.email },
    contact.linkedin && { href: contact.linkedin, label: contact.linkedin, name: site.ui.linkedin },
    contact.github && { href: contact.github, label: contact.github, name: site.ui.github },
  ].filter((link) => link !== null && link !== '')

  return (
    <>
      <p>{contact.message}</p>

      {links.length === 0 ? (
        <p>{site.ui.noContact}</p>
      ) : (
        <dl>
          {links.map((link) => (
            <div className="contact-row" key={link.name}>
              <dt>{link.name}</dt>
              <dd>
                <a href={link.href} rel="noreferrer" target="_blank">
                  {link.label}
                </a>
              </dd>
            </div>
          ))}
        </dl>
      )}
    </>
  )
}
