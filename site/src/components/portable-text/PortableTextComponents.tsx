import Image from 'next/image'
import { urlFor } from '@/sanity/lib/image'
import type { PortableTextComponents } from '@portabletext/react'

const components: PortableTextComponents = {
  types: {
    image: ({ value }: { value: any }) => {
      if (!value?.asset) return null

      const imageUrl = urlFor(value.asset).width(800).quality(80).auto('format').url()

      return (
        <figure className="my-8">
          <Image
            src={imageUrl}
            alt={value.alt || ''}
            width={800}
            height={450}
            className="rounded-lg w-full h-auto"
          />
          {value.caption && (
            <figcaption className="mt-2 text-center text-sm text-muted">
              {value.caption}
            </figcaption>
          )}
        </figure>
      )
    },
  },
  marks: {
    link: ({ children, value }: { children: React.ReactNode; value?: any }) => {
      const target = value?.openInNewTab ? '_blank' : undefined
      const rel = value?.openInNewTab ? 'noopener noreferrer' : undefined

      return (
        <a href={value?.href} target={target} rel={rel}>
          {children}
        </a>
      )
    },
  },
  block: {
    blockquote: ({ children }: { children?: React.ReactNode }) => (
      <blockquote>{children}</blockquote>
    ),
    h2: ({ children }: { children?: React.ReactNode }) => <h2>{children}</h2>,
    h3: ({ children }: { children?: React.ReactNode }) => <h3>{children}</h3>,
    normal: ({ children }: { children?: React.ReactNode }) => <p>{children}</p>,
  },
}

export { components as portableTextComponents }
export default components
