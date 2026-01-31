import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { PortableText } from '@portabletext/react'
import { sanityFetch } from '@/sanity/lib/live'
import { urlFor } from '@/sanity/lib/image'
import {
  ARTICLE_BY_SLUG_QUERY,
  ALL_ARTICLE_SLUGS_QUERY,
  SITE_SETTINGS_QUERY,
} from '@/sanity/lib/queries'
import { portableTextComponents } from '@/components/portable-text/PortableTextComponents'
import { formatDate } from '@/lib/utils'

interface ArticlePageProps {
  params: Promise<{ category: string; slug: string }>
}

export async function generateStaticParams() {
  const articles = await sanityFetch<any[]>(ALL_ARTICLE_SLUGS_QUERY)
  if (!articles) return []

  return articles.map((a: any) => ({
    category: a.category ?? 'sin-categoria',
    slug: a.slug,
  }))
}

export async function generateMetadata({
  params,
}: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params
  const article = await sanityFetch<any>(ARTICLE_BY_SLUG_QUERY, { slug })

  if (!article) {
    return { title: 'Articulo no encontrado' }
  }

  const ogImage = article.featuredImage?.asset
    ? urlFor(article.featuredImage.asset).width(1200).height(630).url()
    : undefined

  return {
    title: article.seo?.title || article.title,
    description: article.seo?.description || article.excerpt || '',
    openGraph: {
      title: article.seo?.title || article.title,
      description: article.seo?.description || article.excerpt || '',
      type: 'article',
      publishedTime: article.publishedDate,
      ...(ogImage && { images: [{ url: ogImage, width: 1200, height: 630 }] }),
    },
    ...(article.seo?.noIndex && {
      robots: { index: false, follow: false },
    }),
  }
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params
  const [article, settings] = await Promise.all([
    sanityFetch<any>(ARTICLE_BY_SLUG_QUERY, { slug }),
    sanityFetch<any>(SITE_SETTINGS_QUERY),
  ])

  if (!article) {
    notFound()
  }

  const categorySlug = article.category?.slug ?? 'sin-categoria'
  const parentSlug = article.category?.parent?.slug
  const scheduleUrl = settings?.scheduleUrl

  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="mb-8">
        <ol className="flex flex-wrap items-center gap-1 text-sm text-muted">
          <li>
            <Link href="/" className="hover:text-accent transition-colors">
              Inicio
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link href="/puentes" className="hover:text-accent transition-colors">
              Puentes
            </Link>
          </li>
          {parentSlug && (
            <>
              <li aria-hidden="true">/</li>
              <li>
                <Link
                  href={`/puentes/${parentSlug}`}
                  className="hover:text-accent transition-colors"
                >
                  {article.category.parent.name}
                </Link>
              </li>
            </>
          )}
          <li aria-hidden="true">/</li>
          <li>
            <Link
              href={`/puentes/${categorySlug}`}
              className="hover:text-accent transition-colors"
            >
              {article.category?.name}
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="truncate text-foreground font-medium" aria-current="page">
            {article.title}
          </li>
        </ol>
      </nav>

      {/* Header */}
      <header>
        {article.category && (
          <Link
            href={`/puentes/${categorySlug}`}
            className="inline-block text-sm font-medium text-accent hover:underline"
          >
            {article.category.name}
          </Link>
        )}
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
          {article.title}
        </h1>
        {article.excerpt && (
          <p className="mt-4 text-lg leading-relaxed text-muted">
            {article.excerpt}
          </p>
        )}
        {article.publishedDate && (
          <time
            dateTime={article.publishedDate}
            className="mt-4 block text-sm text-muted"
          >
            {formatDate(article.publishedDate)}
          </time>
        )}
      </header>

      {/* Featured image */}
      {article.featuredImage?.asset && (
        <figure className="mt-8">
          <Image
            src={urlFor(article.featuredImage.asset)
              .width(900)
              .quality(80)
              .auto('format')
              .url()}
            alt={article.featuredImage.alt || article.title}
            width={900}
            height={506}
            priority
            className="w-full rounded-lg"
          />
        </figure>
      )}

      {/* Bridge Context */}
      {article.bridgeContext &&
        (article.bridgeContext.anthroposophicInsight ||
          article.bridgeContext.modernConnection) && (
          <aside
            className="mt-10 rounded-lg border border-border bg-accent-light/30 p-6 sm:p-8"
            aria-label="El Puente"
          >
            <p className="text-xs font-bold uppercase tracking-widest text-accent">
              El puente
            </p>
            <p className="mt-1 text-sm text-muted">
              Lo que Steiner enseno y la ciencia llego a reconocer
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {article.bridgeContext.anthroposophicInsight && (
                <div className="rounded-md border-l-4 border-accent bg-white p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-accent">
                    Lo que Steiner enseno
                  </p>
                  <p className="mt-2 font-serif text-sm leading-relaxed text-foreground">
                    {article.bridgeContext.anthroposophicInsight}
                  </p>
                </div>
              )}

              {article.bridgeContext.modernConnection && (
                <div className="rounded-md border-l-4 border-foreground/30 bg-white p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-foreground/60">
                    Lo que la ciencia llego a reconocer
                  </p>
                  <p className="mt-2 font-serif text-sm leading-relaxed text-foreground">
                    {article.bridgeContext.modernConnection}
                  </p>
                </div>
              )}
            </div>
          </aside>
        )}

      {/* Content */}
      {article.content && (
        <div className="prose mt-10">
          <PortableText
            value={article.content}
            components={portableTextComponents}
          />
        </div>
      )}

      {/* Source attribution */}
      {article.source && (article.source.author || article.source.publication) && (
        <footer className="mt-10 rounded-lg border border-border bg-background p-5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted">
            Fuente
          </h2>
          <p className="mt-2 text-sm text-muted">
            {article.source.author && (
              <span>Por {article.source.author}</span>
            )}
            {article.source.author && article.source.publication && ' — '}
            {article.source.publication && (
              <span>{article.source.publication}</span>
            )}
          </p>
          {article.source.url && (
            <a
              href={article.source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-1 text-sm text-accent hover:underline"
            >
              Ver fuente original
              <svg
                className="h-3.5 w-3.5"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
                />
              </svg>
            </a>
          )}
        </footer>
      )}

      {/* Back link */}
      <div className="mt-10">
        <Link
          href={`/puentes/${categorySlug}`}
          className="inline-flex items-center gap-1 text-sm font-medium text-accent hover:underline"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
          Volver a {article.category?.name || 'Puentes'}
        </Link>
      </div>

      {/* CTA */}
      {scheduleUrl && (
        <div className="mt-12 rounded-lg border border-border bg-accent-light/30 p-6 sm:p-8 text-center">
          <p className="text-lg font-semibold text-foreground">
            ¿Este tema te resonó?
          </p>
          <p className="mt-2 text-sm text-muted">
            Conversalo con Pablo en una consulta médica con enfoque antroposófico.
          </p>
          <a
            href={scheduleUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-block rounded-lg bg-accent px-6 py-3 text-sm font-medium text-white hover:opacity-90 transition-opacity"
          >
            Agendar hora
          </a>
        </div>
      )}
    </article>
  )
}
