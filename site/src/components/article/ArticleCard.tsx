import Image from 'next/image'
import Link from 'next/link'
import { urlFor } from '@/sanity/lib/image'
import { formatDate } from '@/lib/utils'

interface ArticleCardProps {
  article: {
    _id: string
    title: string
    slug: string
    excerpt?: string
    featuredImage?: {
      asset: any
      alt?: string
    }
    category?: {
      name: string
      slug: string
    }
    publishedDate?: string
    bridgeContext?: {
      anthroposophicInsight?: string
      modernConnection?: string
    }
  }
}

export default function ArticleCard({ article }: ArticleCardProps) {
  const href = `/puentes/${article.category?.slug ?? 'sin-categoria'}/${article.slug}`
  const hasBridge =
    article.bridgeContext?.anthroposophicInsight ||
    article.bridgeContext?.modernConnection

  return (
    <article className="group flex flex-col overflow-hidden rounded-lg border border-border bg-white transition-shadow hover:shadow-md">
      {/* Image */}
      {article.featuredImage?.asset && (
        <Link href={href} className="relative aspect-[16/9] overflow-hidden">
          <Image
            src={urlFor(article.featuredImage.asset).width(600).height(338).quality(75).auto('format').url()}
            alt={article.featuredImage.alt || article.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </Link>
      )}

      {/* Content */}
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        {/* Meta row */}
        <div className="flex items-center gap-3 text-xs text-muted">
          {article.category && (
            <Link
              href={`/puentes/${article.category.slug}`}
              className="font-medium text-accent hover:underline"
            >
              {article.category.name}
            </Link>
          )}
          {article.publishedDate && (
            <time dateTime={article.publishedDate}>
              {formatDate(article.publishedDate)}
            </time>
          )}
        </div>

        {/* Title */}
        <h3 className="mt-2 text-lg font-semibold leading-snug text-foreground group-hover:text-accent transition-colors">
          <Link href={href}>{article.title}</Link>
        </h3>

        {/* Bridge context — the soul of this site */}
        {hasBridge ? (
          <div className="mt-3 flex-1 space-y-2">
            {article.bridgeContext!.anthroposophicInsight && (
              <p className="text-sm leading-relaxed text-muted line-clamp-2">
                <span className="font-semibold text-accent">La intuicion: </span>
                {article.bridgeContext!.anthroposophicInsight}
              </p>
            )}
            {article.bridgeContext!.modernConnection && (
              <p className="text-sm leading-relaxed text-muted line-clamp-2">
                <span className="font-semibold text-foreground/60">La confirmacion: </span>
                {article.bridgeContext!.modernConnection}
              </p>
            )}
          </div>
        ) : article.excerpt ? (
          <p className="mt-2 flex-1 text-sm leading-relaxed text-muted line-clamp-3">
            {article.excerpt}
          </p>
        ) : null}

        {/* Read more */}
        <Link
          href={href}
          className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-accent hover:underline"
        >
          Ver el puente
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
    </article>
  )
}
