import type { Metadata } from 'next'
import Link from 'next/link'
import { sanityFetch } from '@/sanity/lib/live'
import { CATEGORIES_QUERY } from '@/sanity/lib/queries'

export const metadata: Metadata = {
  title: 'Puentes',
  description:
    'Explora las categorias que conectan la vision antroposofica con el mundo moderno.',
}

export default async function PuentesPage() {
  const categories = await sanityFetch<any[]>(CATEGORIES_QUERY)

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
      {/* Header */}
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Puentes
        </h1>
        <p className="mt-3 max-w-2xl text-muted sm:text-lg">
          Cada puente conecta un tema del mundo actual con la sabiduria de la
          Antroposofia. Explora las categorias y encuentra articulos con sentido.
        </p>
      </header>

      {/* Categories list */}
      {categories && categories.length > 0 ? (
        <div className="mt-12 space-y-8">
          {categories.map((cat: any) => (
            <section
              key={cat._id}
              className="rounded-lg border border-border bg-white p-6 sm:p-8"
            >
              <div className="flex items-start gap-4">
                {cat.icon && (
                  <span className="text-3xl" aria-hidden="true">
                    {cat.icon}
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <h2 className="text-xl font-bold text-foreground sm:text-2xl">
                    <Link
                      href={`/puentes/${cat.slug}`}
                      className="hover:text-accent transition-colors"
                    >
                      {cat.name}
                    </Link>
                  </h2>
                  {cat.description && (
                    <p className="mt-2 text-muted">{cat.description}</p>
                  )}
                  <p className="mt-2 text-sm text-muted">
                    {cat.articleCount ?? 0}{' '}
                    {cat.articleCount === 1 ? 'articulo' : 'articulos'}
                  </p>

                  {/* Subcategories */}
                  {cat.subcategories && cat.subcategories.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {cat.subcategories.map((sub: any) => (
                        <Link
                          key={sub._id}
                          href={`/puentes/${sub.slug}`}
                          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1 text-sm text-muted hover:border-accent hover:text-accent transition-colors"
                        >
                          {sub.name}
                          <span className="text-xs opacity-60">
                            ({sub.articleCount ?? 0})
                          </span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                {/* Arrow link */}
                <Link
                  href={`/puentes/${cat.slug}`}
                  className="hidden sm:flex shrink-0 items-center justify-center rounded-full border border-border p-2 text-muted hover:border-accent hover:text-accent transition-colors"
                  aria-label={`Ver ${cat.name}`}
                >
                  <svg
                    className="h-5 w-5"
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
              </div>
            </section>
          ))}
        </div>
      ) : (
        <p className="mt-12 text-muted">
          Aun no hay categorias disponibles. Vuelve pronto.
        </p>
      )}
    </div>
  )
}
