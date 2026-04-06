import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // TypeScript strict mode réactivé - erreurs TypeScript maintenant corrigées avec les nouveaux types
    ignoreBuildErrors: false,
  },
experimental: {
    // CSS optimization désactivé temporairement - problème avec critters
    // optimizeCss: true,
  },
};

export default nextConfig;
