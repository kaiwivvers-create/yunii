import type { NextConfig } from "next";

// Backend base URL for the /api rewrites. Override with BACKEND_URL when the
// backend is hosted separately (e.g. http://<server-ip>:7777).
const backendUrl = process.env.BACKEND_URL || 'http://localhost:7777';

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
