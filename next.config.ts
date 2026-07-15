import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compiler: {
    removeConsole:
      process.env.NEXT_PUBLIC_NODE_ENV === "production"
        ? {
            exclude: ["warn"],
          }
        : false,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "www.google.com",
      pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
