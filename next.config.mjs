/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Nodig voor het uploaden van productfoto's in het beheer
    serverActions: { bodySizeLimit: '5mb' },
  },
};
export default nextConfig;
