import type { NextConfig } from "next";

// Pages that must never show up in search results, whatever robots.txt says.
const noIndex = [{ key: "X-Robots-Tag", value: "noindex, nofollow" }];

const nextConfig: NextConfig = {
  // the public site lives at /home; a config redirect sends crawlers a real 308
  async redirects() {
    return [{ source: "/", destination: "/home", permanent: true }];
  },
  async headers() {
    return ["/dashboard/:path*", "/login", "/register", "/verify"].map((source) => ({
      source,
      headers: noIndex,
    }));
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
      {
        protocol: "https",
        hostname: "aaitebbzendkkllhefpi.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
