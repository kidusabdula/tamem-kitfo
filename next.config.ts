import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    // Our own sharp pipeline pre-generates AVIF/WebP derivatives into
    // /public/images, so next/image mostly serves them directly. Remote
    // patterns cover dish + gallery uploads served from Supabase Storage.
    remotePatterns: [
      { protocol: 'https', hostname: '*.supabase.co', pathname: '/storage/v1/object/public/**' },
    ],
    formats: ['image/avif', 'image/webp'],
  },
  // typedRoutes is off: every public URL is built from a locale template
  // (`/${lang}/menu`) by lib/routes.ts, which typed routes cannot narrow.
  // The routes helper gives the same "rename breaks the build" safety.
  typedRoutes: false,
}

export default nextConfig
