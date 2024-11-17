/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    images: {
      remotePatterns: [
        {
          // aws s3
          protocol: "https",
          hostname: "**",
          pathname: "/**",
        },
        {
          // aws s3
          protocol: "https",
          hostname: "**.amazonaws.com",
          pathname: "/**",
        },
      ],
    },
  }
  
  export default nextConfig
  