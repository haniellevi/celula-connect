import type { Metadata } from 'next'

type LogoPaths = {
  light?: string
  dark?: string
}

type IconPaths = {
  default?: string
  svg?: string
  png16?: string
  png32?: string
  apple?: string
  shortcut?: string
}

export type AnalyticsConfig = {
  gtmId?: string
  gaMeasurementId?: string
  facebookPixelId?: string
}

const rawSiteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://celulaconnect.com'

const metadataBase = (() => {
  try {
    return new URL(rawSiteUrl)
  } catch {
    return new URL('https://celulaconnect.com')
  }
})()

const toAbsoluteUrl = (path?: string) => {
  if (!path) return undefined
  try {
    return new URL(path, metadataBase).toString()
  } catch {
    return path
  }
}

export const site = {
  name: 'Célula Connect',
  shortName: 'Célula Connect',
  description:
    'Plataforma moderna para gestão de células, trilhas de discipulado, avisos e automações pastorais.',
  url: rawSiteUrl,
  metadataBase,
  author: 'Equipe Célula Connect',
  keywords: [
    'células',
    'discipulado',
    'igreja',
    'gestão pastoral',
    'Next.js',
    'SaaS',
    'Clerk',
  ],
  ogImage: '/og-image.png',
  logo: {
    light: '/logo-light.svg',
    dark: '/logo-dark.svg',
  } as LogoPaths,
  icons: {
    default: '/favicon.ico',
    svg: '/favicon.svg',
    png16: '/favicon-16x16.png',
    png32: '/favicon-32x32.png',
    apple: '/apple-touch-icon.png',
    shortcut: '/favicon-16x16.png',
  } as IconPaths,
  manifest: '/site.webmanifest',
  socials: {
    twitter: '@celulaconnect',
  },
  support: {
    email: 'suporte@celulaconnect.com',
  },
  analytics: {
    gtmId: process.env.NEXT_PUBLIC_GTM_ID,
    gaMeasurementId: process.env.NEXT_PUBLIC_GA_ID,
    facebookPixelId: process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID,
  } as AnalyticsConfig,
} as const

const ogImageUrl = toAbsoluteUrl(site.ogImage)
const iconDescriptors = [
  site.icons.svg ? { url: toAbsoluteUrl(site.icons.svg)!, type: 'image/svg+xml' } : null,
  site.icons.png32
    ? { url: toAbsoluteUrl(site.icons.png32)!, type: 'image/png', sizes: '32x32' }
    : null,
  site.icons.png16
    ? { url: toAbsoluteUrl(site.icons.png16)!, type: 'image/png', sizes: '16x16' }
    : null,
  site.icons.default
    ? { url: toAbsoluteUrl(site.icons.default)!, type: 'image/x-icon' }
    : null,
].filter(
  (icon): icon is { url: string; type?: string; sizes?: string } => icon !== null,
)

const shortcutIcons = site.icons.shortcut
  ? [{ url: toAbsoluteUrl(site.icons.shortcut)!, rel: 'shortcut icon' }]
  : undefined

const appleIcons = site.icons.apple ? [{ url: toAbsoluteUrl(site.icons.apple)! }] : undefined
const manifestUrl = site.manifest ? toAbsoluteUrl(site.manifest) : undefined

export const siteMetadata: Metadata = {
  metadataBase,
  title: {
    default: site.name,
    template: `%s | ${site.shortName}`,
  },
  description: site.description,
  keywords: [...site.keywords],
  authors: [{ name: site.author }],
  openGraph: {
    title: site.name,
    description: site.description,
    url: site.url,
    siteName: site.name,
    images: ogImageUrl ? [{ url: ogImageUrl }] : undefined,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: site.name,
    description: site.description,
    images: ogImageUrl ? [ogImageUrl] : undefined,
  },
  icons: {
    icon: iconDescriptors.length > 0 ? iconDescriptors : undefined,
    apple: appleIcons,
    shortcut: shortcutIcons,
  },
  manifest: manifestUrl,
  alternates: {
    canonical: site.url,
  },
}
