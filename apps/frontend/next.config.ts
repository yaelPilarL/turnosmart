import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Artefacto autocontenido: permite alojar Next.js en Azure App Service si Vercel Hobby no aplica (A07).
  output: 'standalone',
  poweredByHeader: false,
  env: {
    NEXT_PUBLIC_RELEASE_SHA: process.env.RELEASE_SHA ?? 'dev',
  },
};

export default nextConfig;
