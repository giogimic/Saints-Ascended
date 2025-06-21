/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost'],
    unoptimized: true,
  },
  webpack: (config, { isServer, dev }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    
    // Disable caching in development
    if (dev) {
      config.cache = false;
    }
    
    return config;
  },
  // Disable page caching in development
  onDemandEntries: {
    maxInactiveAge: 0,
    pagesBufferLength: 2,
  },
  env: {
    CUSTOM_KEY: 'ark-server-manager',
  },
  async rewrites() {
    return [
      {
        source: '/api/ws',
        destination: '/api/websocket',
      },
    ];
  },
};

export default nextConfig; 