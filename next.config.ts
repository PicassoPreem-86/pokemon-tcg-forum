import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  // Turbopack disabled for production builds (causing hang issues)
  // turbopack: {
  //   root: path.resolve(__dirname),
  // },
  experimental: {
    optimizePackageImports: ['lucide-react', 'date-fns'],
  },
  compiler: {
    // Console logs removed in production for security and performance
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },
  images: {
    // Allow data URLs for user-uploaded images (base64)
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
  },
  // Production optimizations
  poweredByHeader: false,
  compress: true,
  reactStrictMode: true,

  // Security headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'Content-Security-Policy',
            value: [
              // Default: only allow resources from same origin
              "default-src 'self'",
              // Scripts: allow inline for Next.js, eval for development, and self
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://accounts.google.com https://www.gstatic.com",
              // Styles: allow inline for styled-components/emotion and Google Fonts
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              // Images: allow self, data URIs, Supabase storage, and Google
              "img-src 'self' data: blob: https://*.supabase.co https://*.googleusercontent.com",
              // Fonts: allow self and Google Fonts
              "font-src 'self' data: https://fonts.gstatic.com",
              // Connect: API calls to self and Supabase
              "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://accounts.google.com https://*.sentry.io",
              // Frames: allow Google OAuth
              "frame-src 'self' https://accounts.google.com",
              // Objects: disallow plugins
              "object-src 'none'",
              // Base URI: restrict to self
              "base-uri 'self'",
              // Forms: only submit to self
              "form-action 'self'",
              // Frame ancestors: only allow same origin (prevents clickjacking)
              "frame-ancestors 'self'",
              // Upgrade insecure requests in production
              process.env.NODE_ENV === 'production' ? 'upgrade-insecure-requests' : '',
            ].filter(Boolean).join('; '),
          },
        ],
      },
    ];
  },
};

// Sentry configuration options
const sentryWebpackPluginOptions = {
  // Suppresses source map uploading logs during build
  silent: true,
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  // Only upload source maps in production
  widenClientFileUpload: true,
  tunnelRoute: "/monitoring",
  hideSourceMaps: true,
  disableLogger: true,
};

// Export with Sentry wrapping if DSN is configured
export default process.env.NEXT_PUBLIC_SENTRY_DSN
  ? withSentryConfig(nextConfig, sentryWebpackPluginOptions)
  : nextConfig;
