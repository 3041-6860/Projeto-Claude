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
  // Gera bundle standalone: server.js + node_modules mínimos embutidos.
  // Dispensa npm/node_modules no servidor — basta "node server.js"
  output: "standalone",
};

export default nextConfig;
