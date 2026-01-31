'use client'

import { useState } from 'react'
import { PortableText } from '@portabletext/react'
import type { PortableTextBlock } from '@portabletext/types'
import components from '@/components/portable-text/PortableTextComponents'

const FALLBACK_BIO =
  'Pablo Moche nacio en Buenos Aires, Argentina, en 1971. A los 20 anos descubrio la obra de Rudolf Steiner, lo que lo llevo a estudiar medicina con una perspectiva antroposofica. Se especializo en medicina interna y se traslado a Chile para profundizar en el seminario de antroposofia.'

interface SobrePabloContentProps {
  content: PortableTextBlock[] | null
}

export default function SobrePabloContent({ content }: SobrePabloContentProps) {
  const [zoomed, setZoomed] = useState(false)

  const hasContent = content && content.length > 0

  return (
    <article className="py-8 sm:py-12">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <header className="mb-8 sm:mb-12">
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Sobre Pablo Moche
          </h1>
          <div className="mt-4 h-1 w-16 rounded bg-accent" aria-hidden="true" />
        </header>

        <div
          className="origin-top-left transition-transform duration-500 ease-in-out"
          style={{ transform: zoomed ? 'scale(1.5)' : 'scale(1)' }}
        >
          <section className="prose font-serif text-lg leading-relaxed text-foreground/90">
            {hasContent ? (
              <PortableText value={content} components={components} />
            ) : (
              <p>{FALLBACK_BIO}</p>
            )}
          </section>
        </div>

        {/* Easter egg: zoom toggle */}
        <div className="mt-10 flex items-center gap-4">
          {!zoomed ? (
            <button
              onClick={() => setZoomed(true)}
              className="text-sm text-muted hover:text-accent transition-colors underline underline-offset-2 decoration-dotted"
              aria-label="Ampliar biografia al 150%"
            >
              Biografia ampliada ;)
            </button>
          ) : (
            <button
              onClick={() => setZoomed(false)}
              className="text-sm font-medium text-accent hover:text-[#6d28d9] transition-colors underline underline-offset-2"
              aria-label="Volver al tamano normal"
            >
              Volver
            </button>
          )}
        </div>
      </div>
    </article>
  )
}
