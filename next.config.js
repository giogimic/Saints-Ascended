/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost'],
    unoptimized: true,
  },
  // Generate build ID with timestamp for cache busting
  generateBuildId: async () => {
    if (process.env.NODE_ENV === 'development') {
      return `dev-${Date.now()}`;
    }
    return null; // Use default build ID for production
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
  // Add cache control headers
  async headers() {
    if (process.env.NODE_ENV === 'development') {
      return [
        {
          source: '/(.*)',
          headers: [
            {
              key: 'Cache-Control',
              value: 'no-cache, no-store, must-revalidate, proxy-revalidate, max-age=0',
            },
            {
              key: 'Pragma',
              value: 'no-cache',
            },
            {
              key: 'Expires',
              value: '0',
            },
            {
              key: 'Surrogate-Control',
              value: 'no-store',
            },
          ],
        },
        {
          source: '/_next/static/(.*)',
          headers: [
            {
              key: 'Cache-Control',
              value: 'no-cache, no-store, must-revalidate',
            },
          ],
        },
        {
          source: '/api/(.*)',
          headers: [
            {
              key: 'Cache-Control',
              value: 'no-cache, no-store, must-revalidate',
            },
          ],
        },
      ];
    }
    return [];
  },
  env: {
    CUSTOM_KEY: 'ark-server-manager',
    BUILD_TIME: new Date().toISOString(),
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