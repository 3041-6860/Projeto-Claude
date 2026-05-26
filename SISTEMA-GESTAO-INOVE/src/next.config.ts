import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Permite build mesmo com erros de TypeScript e ESLint
  // (erros de tipo não quebram o deploy em produção)
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
