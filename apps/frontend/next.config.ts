import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@nestject/shared"],
  serverExternalPackages: ["pg", "pg-native"],
};

export default nextConfig;
