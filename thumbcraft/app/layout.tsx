import type { Metadata } from 'next'
import { GOOGLE_FONTS_URL } from '@/lib/fonts'
import './globals.css'

export const metadata: Metadata = {
  title: 'Free Thumbnail Maker — Create YouTube Thumbnails, OG Images & Social Graphics | ThumbCraft',
  description:
    'Create stunning YouTube thumbnails, OG images, and social media graphics for free. Drag-and-drop editor with templates, custom fonts, shapes, and one-click export. No design skills needed.',
  keywords: [
    'free thumbnail maker',
    'youtube thumbnail generator',
    'og image creator',
    'social media graphics',
    'thumbnail editor',
    'free graphic design tool',
    'youtube thumbnail maker free',
    'open graph image generator',
  ],
  openGraph: {
    title: 'ThumbCraft — Free Thumbnail & OG Image Maker',
    description:
      'Create stunning thumbnails and social media graphics in seconds. Free drag-and-drop editor with templates.',
    type: 'website',
    url: 'https://thumbcraft.app',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'ThumbCraft Editor' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ThumbCraft — Free Thumbnail & OG Image Maker',
    description: 'Create stunning thumbnails and social media graphics in seconds.',
    images: ['/og-image.png'],
  },
  robots: { index: true, follow: true },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link href={GOOGLE_FONTS_URL} rel="stylesheet" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'SoftwareApplication',
              name: 'ThumbCraft',
              applicationCategory: 'DesignApplication',
              operatingSystem: 'Web',
              offers: [
                {
                  '@type': 'Offer',
                  price: '0',
                  priceCurrency: 'USD',
                  description: 'Free tier with 5 exports per day',
                },
                {
                  '@type': 'Offer',
                  price: '9',
                  priceCurrency: 'USD',
                  description: 'Pro plan with unlimited exports',
                },
              ],
              description:
                'Create stunning YouTube thumbnails, OG images, and social media graphics for free.',
              url: 'https://thumbcraft.app',
            }),
          }}
        />
      </head>
      <body className="min-h-screen">{children}</body>
    </html>
  )
}
