/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['avatars.githubusercontent.com'],
  },
};

if (process.env.NEXT_PUBLIC_CLOUDFLARE === 'true') {
  nextConfig.output = 'export';
}

module.exports = nextConfig;