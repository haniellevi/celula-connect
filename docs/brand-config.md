# Brand Configuration

Centralized brand settings live in `src/lib/brand-config.ts`. Update this file to change your app name, description, URLs, assets, and analytics IDs in one place.

## What’s Configured
- name/shortName: Display name used in headers/footers and metadata
- description/keywords/author: SEO-friendly defaults used for page metadata
- url: Public base URL (from `NEXT_PUBLIC_APP_URL`)
- metadataBase: Canonical base URL derived from `url` for Next.js metadata
- logo/icons: Paths to assets under `/public`
- ogImage: Social sharing image path under `/public`
- socials/support: Contact and social handles
- analytics: Google Tag Manager, GA4, and Meta Pixel IDs (from env)

## Where It’s Used
- Root metadata in `src/app/layout.tsx` via `siteMetadata`
- Public header and footer via `site.name`/`site.shortName`
- Global analytics injection via `AnalyticsPixels` component

## Environment Variables
Add these to `.env.local` (see `.env.example`):
- `NEXT_PUBLIC_APP_URL` – public site URL
- `NEXT_PUBLIC_GTM_ID` – Google Tag Manager ID (optional)
- `NEXT_PUBLIC_GA_ID` – Google Analytics 4 measurement ID (optional)
- `NEXT_PUBLIC_FACEBOOK_PIXEL_ID` – Meta/Facebook Pixel ID (optional)

## Asset Paths
Place files under `/public` and update the paths in `brand-config.ts`:
- `logo.light` – e.g. `/logo-light.svg`
- `logo.dark` – e.g. `/logo-dark.svg`
- `icons.default` – e.g. `/favicon.ico`
- `icons.svg` – e.g. `/favicon.svg`
- `icons.png16` – e.g. `/favicon-16x16.png`
- `icons.png32` – e.g. `/favicon-32x32.png`
- `icons.shortcut` – e.g. `/favicon-16x16.png`
- `icons.apple` – e.g. `/apple-touch-icon.png`
- `manifest` – e.g. `/site.webmanifest`
- `ogImage` – e.g. `/og-image.png`

## Extending
You can safely add new fields (e.g. `pricing`, `legal`, `productHunt`) to the `site` object and consume them across your app via `import { site } from '@/lib/brand-config'`.
