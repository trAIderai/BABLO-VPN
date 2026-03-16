/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  async rewrites() {
    return {
      // fallback rewrites only run if no matching API route exists
      fallback: [
        {
          source: '/api/:path*',
          destination: 'http://wg-easy:51821/api/:path*',
        },
      ],
    };
  },
};

module.exports = nextConfig;
