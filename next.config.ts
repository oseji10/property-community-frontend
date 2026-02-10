/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  // distDir: 'build', // Custom build directory
    output: 'export',
 trailingSlash: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
      ignoreBuildErrors: true, 
    },
    images: { unoptimized: true }, 
};

module.exports = nextConfig;