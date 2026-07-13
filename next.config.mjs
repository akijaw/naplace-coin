/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // No ESLint config in this project — don't block builds on lint.
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
