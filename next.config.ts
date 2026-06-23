import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  serverExternalPackages: ["sharp"],
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: "/uploads/:path*",
          destination: "/api/serve-upload/:path*",
        },
      ],
    };
  },
  async redirects() {
    return [
      {
        source: "/admin/feedback",
        destination: "/admin",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
