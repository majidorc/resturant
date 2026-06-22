import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
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
