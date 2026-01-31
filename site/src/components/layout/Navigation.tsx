import Link from 'next/link'

export interface Category {
  _id: string
  name: string
  slug: string
  subcategories?: {
    _id: string
    name: string
    slug: string
  }[]
}

interface NavigationProps {
  categories?: Category[]
  onLinkClick?: () => void
  className?: string
  variant?: 'desktop' | 'mobile'
  scheduleUrl?: string
}

export const navLinks = [
  { href: '/sobre-pablo', label: 'Sobre Pablo' },
  { href: '/seminarios', label: 'Seminarios' },
  { href: '/contacto', label: 'Contacto' },
] as const

export default function Navigation({
  categories = [],
  onLinkClick,
  className = '',
  variant = 'desktop',
  scheduleUrl,
}: NavigationProps) {
  if (variant === 'mobile') {
    return (
      <nav className={className} aria-label="Menu principal">
        <ul className="flex flex-col gap-1">
          {/* Puentes section */}
          <li>
            <Link
              href="/puentes"
              onClick={onLinkClick}
              className="block px-4 py-3 text-base font-medium text-foreground hover:bg-accent-light hover:text-accent rounded-lg transition-colors"
            >
              Puentes
            </Link>
            {categories.length > 0 && (
              <ul className="ml-4 border-l-2 border-border">
                {categories.map((category) => (
                  <li key={category._id}>
                    <Link
                      href={`/puentes/${category.slug}`}
                      onClick={onLinkClick}
                      className="block px-4 py-2 text-sm text-muted hover:text-accent transition-colors"
                    >
                      {category.name}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </li>

          {/* Static links */}
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                onClick={onLinkClick}
                className="block px-4 py-3 text-base font-medium text-foreground hover:bg-accent-light hover:text-accent rounded-lg transition-colors"
              >
                {link.label}
              </Link>
            </li>
          ))}

          {/* CTA */}
          {scheduleUrl && (
            <li className="mt-4 px-4">
              <a
                href={scheduleUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={onLinkClick}
                className="block w-full rounded-lg bg-accent px-4 py-3 text-center text-base font-medium text-white hover:opacity-90 transition-opacity"
              >
                Agendar hora
              </a>
            </li>
          )}
        </ul>
      </nav>
    )
  }

  return null
}
