/** @type {import('next').NextConfig} */
const remotePatterns = [];

if (process.env.S3_PUBLIC_BASE_URL) {
  try {
    const url = new URL(process.env.S3_PUBLIC_BASE_URL);
    remotePatterns.push({
      protocol: url.protocol.replace(":", ""),
      hostname: url.hostname,
    });
  } catch {
    // ignore invalid URL at build time
  }
}

const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
};

export default nextConfig;
