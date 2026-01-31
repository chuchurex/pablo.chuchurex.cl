import type { Metadata } from 'next'
import { sanityFetch } from '@/sanity/lib/live'
import { PAGE_BY_SLUG_QUERY } from '@/sanity/lib/queries'
import type { PortableTextBlock } from '@portabletext/types'
import SobrePabloContent from './SobrePabloContent'

interface PageData {
  _id: string
  title: string
  slug: string
  content: PortableTextBlock[] | null
  template: string | null
  seo: {
    title: string
    description: string
    image: unknown | null
    noIndex: boolean
  }
}

async function getPageData(): Promise<PageData | null> {
  try {
    const data = await sanityFetch<PageData | null>(PAGE_BY_SLUG_QUERY, {
      slug: 'sobre-pablo',
    })
    return data
  } catch {
    return null
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageData()

  const title = page?.seo?.title || 'Sobre Pablo Moche'
  const description =
    page?.seo?.description ||
    'Conoce la trayectoria de Pablo Moche: medico, investigador y puente entre la antroposofia y el mundo moderno.'

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'profile',
    },
    ...(page?.seo?.noIndex ? { robots: { index: false, follow: false } } : {}),
  }
}

export default async function SobrePabloPage() {
  const page = await getPageData()

  return <SobrePabloContent content={page?.content ?? null} />
}
