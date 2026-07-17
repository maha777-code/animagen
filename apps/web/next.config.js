/** Prevent R3F / Three.js from being evaluated during SSR. */
const nextConfig = {
  output: 'export',
  transpilePackages: ['@animagen/scene-schema', '@animagen/parser', '@animagen/engine'],
  images: { unoptimized: true },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push({
        three: 'commonjs three',
        '@react-three/fiber': 'commonjs @react-three/fiber',
        '@react-three/drei': 'commonjs @react-three/drei',
      });
    }
    return config;
  },
};

module.exports = nextConfig;
