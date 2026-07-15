/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  transpilePackages: ['@animagen/scene-schema', '@animagen/parser', '@animagen/engine'],
  images: { unoptimized: true },
};

module.exports = nextConfig;
