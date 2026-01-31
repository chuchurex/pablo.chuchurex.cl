import type { Metadata } from 'next'
import { Inter, Lora } from 'next/font/google'
import './globals.css'

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
})

const lora = Lora({
  variable: '--font-lora',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: {
    default: 'Pablo Moche — Articulos con Sentido',
    template: '%s | Pablo Moche',
  },
  description:
    'Un puente entre la Antroposofia y el mundo moderno. Articulos que conectan la vision espiritual con la ciencia actual.',
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || 'https://pablomoche.cl',
  ),
  openGraph: {
    type: 'website',
    locale: 'es_CL',
    siteName: 'Pablo Moche',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body className={`${inter.variable} ${lora.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  )
}
