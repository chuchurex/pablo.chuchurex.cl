import type { MetadataRoute } from 'next'
import { sanityFetch } from '@/sanity/lib/live'
import { SITEMAP_QUERY } from '@/sanity/lib/queries'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://pablomoche.cl'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages = await sanityFetch<
    Array<{ href: string; _updatedAt: string }>
  >(SITEMAP_QUERY)

  const dynamicPages = pages
    .filter((p) => p.href)
    .map((page) => ({
      url: `${BASE_URL}${page.href}`,
      lastModified: new Date(page._updatedAt),
      changeFrequency: 'weekly' as const,
      priority: page.href === '/' ? 1 : 0.7,
    }))

  const staticPages = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${BASE_URL}/puentes`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/sobre-pablo`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/contacto`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/seminarios`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
  ]

  return [...staticPages, ...dynamicPages]
}
