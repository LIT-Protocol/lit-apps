module.exports = {
  reactStrictMode: true,
  transpilePackages: ["@getlit/ui"],
  webpack: (config) => {
    config.resolve.fallback = { fs: false };

    return config;
  },
};
