import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
  experimental: {
    optimizePackageImports: ['lucide-react', 'date-fns'],
  },
  compiler: {
    // Temporarily disable console removal for debugging auth issues
    // removeConsole: process.env.NODE_ENV === 'production',
  },
  images: {
    // Allow data URLs for user-uploaded images (base64)
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default nextConfig;
