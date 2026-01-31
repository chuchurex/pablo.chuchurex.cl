import Link from 'next/link'
import { sanityFetch } from '@/sanity/lib/live'
import { SITE_SETTINGS_QUERY } from '@/sanity/lib/queries'
import { navLinks } from './Navigation'

const footerNav = [
  { href: '/puentes', label: 'Puentes' },
  ...navLinks,
] as const

export default async function Footer() {
  const year = new Date().getFullYear()

  let scheduleUrl: string | undefined
  try {
    const settings = await sanityFetch<any>(SITE_SETTINGS_QUERY)
    scheduleUrl = settings?.scheduleUrl
  } catch {
    // Fail gracefully
  }

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
              Médico antroposófico. Un puente entre la visión espiritual y la ciencia moderna.
            </p>
          </div>

          {/* Navigation + CTA */}
          <div className="flex flex-col items-center gap-4 sm:items-end">
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
            {scheduleUrl && (
              <a
                href={scheduleUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white hover:opacity-90 transition-opacity"
              >
                Agendar hora
              </a>
            )}
          </div>
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
