import Link from 'next/link'
import { sanityFetch } from '@/sanity/lib/live'
import { CATEGORIES_QUERY, SITE_SETTINGS_QUERY } from '@/sanity/lib/queries'
import HeaderClient from './HeaderClient'
import type { Category } from './Navigation'

interface SanityCategory {
  _id: string
  name: string
  slug: string
  description?: string
  icon?: string
  articleCount?: number
  subcategories?: {
    _id: string
    name: string
    slug: string
    articleCount?: number
  }[]
}

export default async function Header() {
  let categories: Category[] = []
  let scheduleUrl: string | undefined

  try {
    const [data, settings] = await Promise.all([
      sanityFetch<SanityCategory[]>(CATEGORIES_QUERY),
      sanityFetch<any>(SITE_SETTINGS_QUERY),
    ])
    categories = (data ?? []).map(({ _id, name, slug, subcategories }) => ({
      _id,
      name,
      slug,
      subcategories: subcategories?.map((sub) => ({
        _id: sub._id,
        name: sub.name,
        slug: sub.slug,
      })),
    }))
    scheduleUrl = settings?.scheduleUrl
  } catch {
    // Fail gracefully - header works without categories
  }

  return (
    <>
      <a href="#main-content" className="skip-link">
        Saltar al contenido
      </a>
      <header className="sticky top-0 z-30 w-full border-b border-border bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo / Site name */}
          <Link
            href="/"
            className="text-lg font-semibold tracking-tight text-foreground hover:text-accent transition-colors"
          >
            Pablo Moche
          </Link>

          {/* Client-side nav (desktop dropdown + mobile menu) */}
          <HeaderClient categories={categories} scheduleUrl={scheduleUrl} />
        </div>
      </header>
    </>
  )
}
