import path from 'node:path'
import { fileURLToPath } from 'node:url'

// This site lives in job-board/ inside a repository whose root is another
// Next.js site. Pin the project root here so builds never reach upward.
const here = path.dirname(fileURLToPath(import.meta.url))

/** @type {import('next').NextConfig} */
const nextConfig = {
  // A self-contained server in .next/standalone: the Docker image and any
  // Node host run it with `node server.js`, no Vercel needed.
  output: 'standalone',
  outputFileTracingRoot: here,
  turbopack: { root: here },
  poweredByHeader: false,
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ]
  },
}

export default nextConfig
