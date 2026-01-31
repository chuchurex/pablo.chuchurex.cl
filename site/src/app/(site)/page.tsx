import Link from 'next/link'
import { sanityFetch } from '@/sanity/lib/live'
import {
  SITE_SETTINGS_QUERY,
  CATEGORIES_QUERY,
  LATEST_ARTICLES_QUERY,
} from '@/sanity/lib/queries'
import ArticleCard from '@/components/article/ArticleCard'

export default async function HomePage() {
  const [settings, categories, articles] = await Promise.all([
    sanityFetch<any>(SITE_SETTINGS_QUERY),
    sanityFetch<any[]>(CATEGORIES_QUERY),
    sanityFetch<any[]>(LATEST_ARTICLES_QUERY, { limit: 6 }),
  ])

  // Pick the first article that has a populated bridge to feature
  const featuredBridge = articles?.find(
    (a: any) =>
      a.bridgeContext?.anthroposophicInsight && a.bridgeContext?.modernConnection,
  )

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-white">
        <div className="mx-auto max-w-5xl px-4 py-20 sm:px-6 sm:py-28 lg:py-32 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Pablo Moche
          </h1>
          <p className="mt-3 text-lg font-medium text-accent sm:text-xl">
            {settings?.tagline || 'Articulos con Sentido'}
          </p>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
            {settings?.heroSubtitle ||
              'Un puente entre la Antroposofia y el mundo moderno. Articulos que conectan la sabiduria espiritual con la ciencia y la vida cotidiana de hoy.'}
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/puentes"
              className="rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white hover:opacity-90 transition-opacity"
            >
              Explorar articulos
            </Link>
            {settings?.scheduleUrl && (
              <a
                href={settings.scheduleUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg border border-border px-5 py-2.5 text-sm font-medium text-foreground hover:border-accent hover:text-accent transition-colors"
              >
                Agendar hora
              </a>
            )}
          </div>
        </div>
      </section>

      {/* What is a bridge — shown through a real example */}
      {featuredBridge && (
        <section className="border-t border-border bg-background">
          <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-20">
            <h2 className="text-center text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Que es un puente
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-center text-base leading-relaxed text-muted">
              Cada articulo en este sitio tiende un puente: lo que Steiner
              enseno primero, la ciencia llego a reconocer despues.
            </p>

            <div className="mt-10 rounded-lg border border-border bg-white p-6 sm:p-8">
              <p className="text-xs font-bold uppercase tracking-widest text-accent">
                Ejemplo
              </p>
              <h3 className="mt-2 font-semibold text-foreground">
                {featuredBridge.title}
              </h3>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <blockquote className="rounded-md border-l-4 border-accent bg-accent-light/20 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-accent">
                    Lo que Steiner enseno
                  </p>
                  <p className="mt-2 font-serif text-sm italic leading-relaxed text-foreground">
                    {featuredBridge.bridgeContext.anthroposophicInsight}
                  </p>
                </blockquote>
                <blockquote className="rounded-md border-l-4 border-foreground/30 bg-background p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-foreground/60">
                    Lo que la ciencia llego a reconocer
                  </p>
                  <p className="mt-2 font-serif text-sm italic leading-relaxed text-foreground">
                    {featuredBridge.bridgeContext.modernConnection}
                  </p>
                </blockquote>
              </div>
              <div className="mt-4 text-right">
                <Link
                  href={`/puentes/${featuredBridge.category?.slug ?? 'sin-categoria'}/${featuredBridge.slug}`}
                  className="text-sm font-medium text-accent hover:underline"
                >
                  Leer este puente completo &rarr;
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Categories */}
      {categories && categories.length > 0 && (
        <section className="border-t border-border bg-white">
          <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-20">
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Explora por tema
            </h2>
            <p className="mt-2 text-muted">
              Salud, educacion, cosmos, espiritualidad — cada categoria es un territorio donde los dos mundos se encuentran.
            </p>

            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {categories.map((cat: any) => (
                <Link
                  key={cat._id}
                  href={`/puentes/${cat.slug}`}
                  className="group flex items-start gap-4 rounded-lg border border-border bg-white p-5 transition-shadow hover:shadow-md"
                >
                  {cat.icon && (
                    <span className="text-2xl" aria-hidden="true">
                      {cat.icon}
                    </span>
                  )}
                  <div className="min-w-0">
                    <h3 className="font-semibold text-foreground group-hover:text-accent transition-colors">
                      {cat.name}
                    </h3>
                    {cat.description && (
                      <p className="mt-1 text-sm text-muted line-clamp-2">
                        {cat.description}
                      </p>
                    )}
                    <p className="mt-2 text-xs text-muted">
                      {cat.articleCount ?? 0}{' '}
                      {cat.articleCount === 1 ? 'articulo' : 'articulos'}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Latest articles */}
      {articles && articles.length > 0 && (
        <section className="border-t border-border bg-white">
          <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-20">
            <div className="flex items-end justify-between">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                  Ultimos puentes
                </h2>
                <p className="mt-2 text-muted">
                  Las publicaciones mas recientes donde lo que Steiner enseno y lo que la ciencia descubrio se encuentran.
                </p>
              </div>
              <Link
                href="/puentes"
                className="hidden sm:inline-flex items-center gap-1 text-sm font-medium text-accent hover:underline"
              >
                Ver todos
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              </Link>
            </div>

            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {articles.map((article: any) => (
                <ArticleCard key={article._id} article={article} />
              ))}
            </div>

            <div className="mt-10 text-center sm:hidden">
              <Link
                href="/puentes"
                className="inline-flex items-center gap-1 text-sm font-medium text-accent hover:underline"
              >
                Ver todos los puentes
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              </Link>
            </div>
          </div>
        </section>
      )}
    </>
  )
}
