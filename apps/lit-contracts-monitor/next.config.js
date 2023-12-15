const webpack = require('webpack');
module.exports = {
  reactStrictMode: true,
  transpilePackages: ["@getlit/ui"],
  webpack: (config) => {
    config.resolve.fallback = { fs: false};
    config.plugins.push(
      new webpack.ProvidePlugin({
          process: "process/browser",
          Buffer: ["buffer", "Buffer"],
      }),
      new webpack.NormalModuleReplacementPlugin(/node:/, (resource) => {
        const mod = resource.request.replace(/^node:/, "");
        switch (mod) {
            case "buffer":
                resource.request = "buffer";
                break;
            case "stream":
                resource.request = "readable-stream";
                break;
            default:
                throw new Error(`Not found ${mod}`);
        }
      })
    );
    return config;
  },
};
