import Link from 'next/link'
import { navLinks } from './Navigation'

const footerNav = [
  { href: '/puentes', label: 'Puentes' },
  ...navLinks,
] as const

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-border bg-white" role="contentinfo">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-8 sm:flex-row sm:items-start sm:justify-between">
          {/* Branding */}
          <div className="text-center sm:text-left">
            <Link
              href="/"
              className="text-lg font-semibold tracking-tight text-foreground hover:text-accent transition-colors"
            >
              Pablo Moche
            </Link>
            <p className="mt-2 max-w-xs text-sm text-muted">
              Un puente entre la antroposofia y el mundo moderno.
            </p>
          </div>

          {/* Navigation */}
          <nav aria-label="Menu del pie de pagina">
            <ul className="flex flex-wrap justify-center gap-x-6 gap-y-2 sm:justify-end">
              {footerNav.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted hover:text-accent transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Copyright */}
        <div className="mt-10 border-t border-border pt-6 text-center">
          <p className="text-xs text-muted">
            &copy; {year} Pablo Moche. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}
