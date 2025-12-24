/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://wg-easy:51821/api/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
