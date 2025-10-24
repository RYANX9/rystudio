/** @type {import('next').NextConfig} */
const nextConfig = {
  // --- START IMAGE CONFIGURATION ---
  images: {
    // Defines allowed external image domains for next/image
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'fdn2.gsmarena.com', // Allows the phone image URL
        port: '',
        pathname: '/vv/bigpic/**',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co', // Allows the image placeholder
        port: '',
        pathname: '/**',
      },
    ],
  },
  // --- END IMAGE CONFIGURATION ---
};

export default nextConfig;
