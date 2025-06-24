import type { NextConfig } from 'next';

const remoteHostname = process.env.S3_ENDPOINT_URL
  ? new URL(process.env.S3_ENDPOINT_URL).hostname
  : 's3.amazonaws.com';

const nextConfig: NextConfig = {
  reactStrictMode: false,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: remoteHostname,
      },
    ],
  },
  serverExternalPackages: ['pino', 'pino-pretty'],
  output: 'standalone',
};

export default nextConfig;
