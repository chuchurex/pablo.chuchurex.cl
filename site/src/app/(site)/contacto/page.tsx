import type { Metadata } from 'next'
import Link from 'next/link'
import { sanityFetch } from '@/sanity/lib/live'
import { SITE_SETTINGS_QUERY } from '@/sanity/lib/queries'

interface SiteSettings {
  siteName: string | null
  tagline: string | null
  scheduleUrl: string | null
  contactEmail: string | null
  socialLinks: { platform: string; url: string }[] | null
  footerText: string | null
}

async function getSettings(): Promise<SiteSettings | null> {
  try {
    return await sanityFetch<SiteSettings | null>(SITE_SETTINGS_QUERY)
  } catch {
    return null
  }
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Contacto',
    description:
      'Ponte en contacto con Pablo Moche. Consultas sobre seminarios, articulos y colaboraciones.',
    openGraph: {
      title: 'Contacto | Pablo Moche',
      description:
        'Ponte en contacto con Pablo Moche. Consultas sobre seminarios, articulos y colaboraciones.',
    },
  }
}

export default async function ContactoPage() {
  const settings = await getSettings()

  const scheduleUrl = settings?.scheduleUrl
  const contactEmail = settings?.contactEmail
  const socialLinks = settings?.socialLinks

  return (
    <article className="py-8 sm:py-12">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <header className="mb-8 sm:mb-12">
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Contacto
          </h1>
          <div className="mt-4 h-1 w-16 rounded bg-accent" aria-hidden="true" />
        </header>

        <div className="space-y-10">
          {/* Schedule / Agenda link */}
          {scheduleUrl && (
            <section aria-labelledby="agenda-heading">
              <h2
                id="agenda-heading"
                className="text-xl font-semibold text-foreground"
              >
                Agenda
              </h2>
              <p className="mt-2 text-muted">
                Consulta la agenda de proximos seminarios, charlas y actividades.
              </p>
              <Link
                href={scheduleUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"
                  />
                </svg>
                Ver agenda completa
              </Link>
            </section>
          )}

          {/* Email contact */}
          {contactEmail && (
            <section aria-labelledby="email-heading">
              <h2
                id="email-heading"
                className="text-xl font-semibold text-foreground"
              >
                Correo electronico
              </h2>
              <p className="mt-2 text-muted">
                Para consultas generales, colaboraciones o preguntas sobre
                articulos.
              </p>
              <a
                href={`mailto:${contactEmail}`}
                className="mt-3 inline-flex items-center gap-2 text-accent underline underline-offset-2 transition-colors hover:text-[#6d28d9]"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
                  />
                </svg>
                {contactEmail}
              </a>
            </section>
          )}

          {/* Social links */}
          {socialLinks && socialLinks.length > 0 && (
            <section aria-labelledby="social-heading">
              <h2
                id="social-heading"
                className="text-xl font-semibold text-foreground"
              >
                Redes
              </h2>
              <ul className="mt-3 flex flex-wrap gap-3">
                {socialLinks.map((link) => (
                  <li key={link.platform}>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-md border border-border px-4 py-2 text-sm text-foreground transition-colors hover:border-accent hover:text-accent"
                    >
                      {link.platform}
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Fallback when nothing is configured */}
          {!scheduleUrl && !contactEmail && (
            <section className="rounded-lg border border-border bg-accent-light/30 p-6 text-center">
              <p className="text-muted">
                La informacion de contacto sera publicada proximamente.
              </p>
            </section>
          )}
        </div>
      </div>
    </article>
  )
}
