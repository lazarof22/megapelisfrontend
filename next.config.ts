import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Mongoose y el driver de MongoDB se ejecutan en el servidor (API routes)
  serverExternalPackages: ["mongoose"],
};

export default nextConfig;
