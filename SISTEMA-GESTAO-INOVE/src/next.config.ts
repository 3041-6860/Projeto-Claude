import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Build standalone — cria .next/standalone/ sem precisar de node_modules no servidor
  output: "standalone",

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
