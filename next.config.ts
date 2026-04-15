import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
  experimental: {
    // Réduit le JS envoyé au client en n'incluant que les icônes réellement utilisées
    optimizePackageImports: ['lucide-react', '@phosphor-icons/react'],
  },
};

export default nextConfig;
