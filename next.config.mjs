/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "render.albiononline.com"
      }
    ]
  }
};

export default nextConfig;