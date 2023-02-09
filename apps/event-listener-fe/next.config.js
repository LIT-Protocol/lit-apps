module.exports = {
  reactStrictMode: true,
  transpilePackages: ["ui"],
  webpack: (config) => {
    config.resolve.fallback = { fs: false };

    config.module = {
      ...config.module,
      exprContextCritical: false,
    };
    
    return config;
  },
};
