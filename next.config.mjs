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
    // `sharp` incluye binarios nativos; si Next intenta empaquetarlo igual
    // que el resto del código, falla en el runtime serverless de Vercel.
    // Esto le dice que lo deje como un require() normal de Node.
    serverComponentsExternalPackages: ["sharp"],
  },
};

export default nextConfig;
