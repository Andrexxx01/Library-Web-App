import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "otimages.com" },
      { protocol: "https", hostname: "image.gramedia.net" },
      { protocol: "https", hostname: "cdn.gramedia.com" },
    ],
  },
};

export default nextConfig;
