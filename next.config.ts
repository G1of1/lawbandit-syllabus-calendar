import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  eslint: {
    // ❌ Allows production builds to succeed even if there are linting errors
    ignoreDuringBuilds: true,
  },
  serverExternalPackages: ['pdf-parse', 'mammoth'],
}

export default nextConfig;
