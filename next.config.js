/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 'ezwjgcjkufuiniwqzkno.supabase.co',
          port: '',
          pathname: '/storage/v1/object/public/**',
        },
      ],
    },
  };
  
  module.exports = nextConfig;