import type { NextConfig } from 'next';
const apiUrl = new URL(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001');

// Permite incluir un dominio propio personalizado para Cloudflare R2 (ej. https://storage.midominio.com)
const customStorageUrlEnv =
  process.env.NEXT_PUBLIC_R2_PUBLIC_URL ||
  process.env.R2_PUBLIC_URL ||
  process.env.NEXT_PUBLIC_STORAGE_URL;

let customStoragePattern: {
  protocol: 'http' | 'https';
  hostname: string;
  port?: string;
} | null = null;

if (customStorageUrlEnv) {
  try {
    const parsed = new URL(customStorageUrlEnv);
    if (!parsed.hostname.endsWith('.r2.dev')) {
      customStoragePattern = {
        protocol: parsed.protocol === 'https:' ? 'https' : 'http',
        hostname: parsed.hostname,
        ...(parsed.port && { port: parsed.port }),
      };
    }
  } catch {
    // Si la URL configurada no es válida, se ignora
  }
}

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.ytimg.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '*.r2.dev',
      },
      ...(customStoragePattern ? [customStoragePattern] : []),
      {
        protocol: apiUrl.protocol === 'https:' ? 'https' : 'http',
        hostname: apiUrl.hostname,
        ...(apiUrl.port && {
          port: apiUrl.port,
        }),
        pathname: '/storage/**',
      },
    ],
  },
};

export default nextConfig;
