import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
      },
      {
        protocol: "https",
        hostname: "*.firebasestorage.app",
      },
    ],
  },
  turbopack: {
    root: ".",
  },
  async redirects() {
    return [
      {
        source: '/student',
        destination: '/admin',
        permanent: true,
      },
      {
        source: '/student/:path*',
        destination: '/admin',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
