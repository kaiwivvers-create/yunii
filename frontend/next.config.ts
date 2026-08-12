import type { NextConfig } from "next";

// Backend base URL for the /api rewrites. Override with BACKEND_URL if the
// backend ever moves; defaults to the production server.
const backendUrl = process.env.BACKEND_URL || 'http://98.142.245.188:7777';

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/:path*`,
      },
    ];
  },
};

export default nextConfig;
