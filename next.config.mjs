/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', 'picsum.photos', 'images.unsplash.com'],
    unoptimized: true,
  },
};

export default nextConfig;
