import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { sanityFetch } from '@/sanity/lib/live'
import {
  ACTIVE_SEMINARS_QUERY,
  SITE_SETTINGS_QUERY,
} from '@/sanity/lib/queries'
import { urlFor } from '@/sanity/lib/image'

interface Seminar {
  _id: string
  title: string
  description: string | null
  type: string | null
  scheduleUrl: string | null
  image: {
    asset: {
      _id: string
      url: string
      metadata?: { lqip?: string; dimensions?: { width: number; height: number } }
    }
    alt?: string
  } | null
}

interface SiteSettings {
  siteName: string | null
  tagline: string | null
  scheduleUrl: string | null
  contactEmail: string | null
}

async function getSeminars(): Promise<Seminar[]> {
  try {
    const data = await sanityFetch<Seminar[]>(ACTIVE_SEMINARS_QUERY)
    return data ?? []
  } catch {
    return []
  }
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
    title: 'Seminarios',
    description:
      'Seminarios de Pablo Moche: formaciones presenciales y online sobre antroposofia, medicina y desarrollo personal.',
    openGraph: {
      title: 'Seminarios | Pablo Moche',
      description:
        'Seminarios de Pablo Moche: formaciones presenciales y online sobre antroposofia, medicina y desarrollo personal.',
    },
  }
}

function SeminarTypeBadge({ type }: { type: string | null }) {
  if (!type) return null

  const isOnline = type.toLowerCase() === 'online'
  const label = isOnline ? 'Online' : 'Presencial'

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
        isOnline
          ? 'bg-blue-50 text-blue-700'
          : 'bg-emerald-50 text-emerald-700'
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          isOnline ? 'bg-blue-500' : 'bg-emerald-500'
        }`}
        aria-hidden="true"
      />
      {label}
    </span>
  )
}

function SeminarCard({ seminar }: { seminar: Seminar }) {
  const imageAsset = seminar.image?.asset
  const linkUrl = seminar.scheduleUrl

  return (
    <article className="group overflow-hidden rounded-xl border border-border bg-white transition-shadow hover:shadow-md">
      {imageAsset && (
        <div className="aspect-[16/9] overflow-hidden bg-accent-light/20">
          <Image
            src={urlFor(imageAsset).width(600).height(338).url()}
            alt={seminar.image?.alt || seminar.title}
            width={600}
            height={338}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            placeholder={imageAsset.metadata?.lqip ? 'blur' : undefined}
            blurDataURL={imageAsset.metadata?.lqip}
          />
        </div>
      )}

      <div className="p-5 sm:p-6">
        <div className="mb-3 flex items-center gap-2">
          <SeminarTypeBadge type={seminar.type} />
        </div>

        <h2 className="text-lg font-semibold text-foreground sm:text-xl">
          {seminar.title}
        </h2>

        {seminar.description && (
          <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted">
            {seminar.description}
          </p>
        )}

        {linkUrl && (
          <Link
            href={linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-accent transition-colors hover:text-[#6d28d9]"
          >
            Ver detalles e inscripcion
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
              />
            </svg>
          </Link>
        )}
      </div>
    </article>
  )
}

export default async function SeminariosPage() {
  const [seminars, settings] = await Promise.all([
    getSeminars(),
    getSettings(),
  ])

  const globalScheduleUrl = settings?.scheduleUrl

  return (
    <section className="py-8 sm:py-12">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <header className="mb-8 sm:mb-12">
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Seminarios
          </h1>
          <div className="mt-4 h-1 w-16 rounded bg-accent" aria-hidden="true" />
          <p className="mt-4 text-lg text-muted">
            Formaciones y encuentros para profundizar en la antroposofia y su
            relacion con la vida contemporanea.
          </p>
        </header>

        {seminars.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2">
            {seminars.map((seminar) => (
              <SeminarCard key={seminar._id} seminar={seminar} />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-border bg-accent-light/30 p-8 text-center">
            <p className="text-lg text-muted">
              Proximamente &mdash; Informacion sobre seminarios
            </p>
          </div>
        )}

        {/* Global schedule link */}
        {globalScheduleUrl && (
          <div className="mt-10 border-t border-border pt-8">
            <p className="text-muted">
              Consulta la agenda completa con todas las fechas y horarios:
            </p>
            <Link
              href={globalScheduleUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90"
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
          </div>
        )}
      </div>
    </section>
  )
}
