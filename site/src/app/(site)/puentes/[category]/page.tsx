import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { sanityFetch } from '@/sanity/lib/live'
import {
  CATEGORIES_QUERY,
  CATEGORY_BY_SLUG_QUERY,
  ARTICLES_BY_CATEGORY_QUERY,
} from '@/sanity/lib/queries'
import ArticleCard from '@/components/article/ArticleCard'

interface CategoryPageProps {
  params: Promise<{ category: string }>
}

export async function generateStaticParams() {
  const categories = await sanityFetch<any[]>(CATEGORIES_QUERY)
  if (!categories) return []

  const params: { category: string }[] = []
  for (const cat of categories) {
    params.push({ category: cat.slug })
    if (cat.subcategories) {
      for (const sub of cat.subcategories) {
        params.push({ category: sub.slug })
      }
    }
  }
  return params
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { category: slug } = await params
  const category = await sanityFetch<any>(CATEGORY_BY_SLUG_QUERY, { slug })

  if (!category) {
    return { title: 'Categoria no encontrada' }
  }

  return {
    title: category.name,
    description:
      category.description ||
      `Articulos sobre ${category.name} — Pablo Moche.`,
  }
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category: slug } = await params
  const category = await sanityFetch<any>(CATEGORY_BY_SLUG_QUERY, { slug })

  if (!category) {
    notFound()
  }

  const articles = await sanityFetch<any[]>(ARTICLES_BY_CATEGORY_QUERY, {
    categoryId: category._id,
  })

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="mb-6">
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
          {category.parent && (
            <>
              <li aria-hidden="true">/</li>
              <li>
                <Link
                  href={`/puentes/${category.parent.slug}`}
                  className="hover:text-accent transition-colors"
                >
                  {category.parent.name}
                </Link>
              </li>
            </>
          )}
          <li aria-hidden="true">/</li>
          <li className="text-foreground font-medium" aria-current="page">
            {category.name}
          </li>
        </ol>
      </nav>

      {/* Category header */}
      <header>
        <div className="flex items-center gap-3">
          {category.icon && (
            <span className="text-3xl" aria-hidden="true">
              {category.icon}
            </span>
          )}
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {category.name}
          </h1>
        </div>
        {category.description && (
          <p className="mt-3 max-w-2xl text-muted sm:text-lg">
            {category.description}
          </p>
        )}
      </header>

      {/* Subcategories */}
      {category.subcategories && category.subcategories.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-2">
          {category.subcategories.map((sub: any) => (
            <Link
              key={sub._id}
              href={`/puentes/${sub.slug}`}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-white px-3 py-1 text-sm text-muted hover:border-accent hover:text-accent transition-colors"
            >
              {sub.name}
              <span className="text-xs opacity-60">
                ({sub.articleCount ?? 0})
              </span>
            </Link>
          ))}
        </div>
      )}

      {/* Articles */}
      {articles && articles.length > 0 ? (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((article: any) => (
            <ArticleCard key={article._id} article={article} />
          ))}
        </div>
      ) : (
        <p className="mt-12 text-muted">
          Aun no hay articulos en esta categoria. Vuelve pronto.
        </p>
      )}
    </div>
  )
}
