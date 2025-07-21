/** @type {import('next').NextConfig} */
const nextConfig = {
  // Next.js 14 has app directory enabled by default
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        undici: false,
      };
    }
    
    // Exclude undici completely from client bundle
    config.externals = config.externals || [];
    if (!isServer) {
      config.externals.push('undici');
    }
    
    // Completely ignore undici module
    config.module.rules.push({
      test: /node_modules\/undici/,
      use: 'null-loader'
    });
    
    return config;
  },
  experimental: {
    esmExternals: 'loose',
  },
}

module.exports = nextConfig 