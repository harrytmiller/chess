/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/graphql',
        destination: 'http://localhost:8080/graphql',
      },
    ];
  },
}

module.exports = nextConfig
