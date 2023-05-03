// webpack.config.js

const path = require("path");
const webpack = require("webpack");

module.exports = {
  entry: "./index.tsx",
  mode: "production",
  output: {
    filename: "bundle.umd.js",
    path: path.resolve(__dirname, "dist"),
    library: "GetLitHooks",
    libraryTarget: "umd",
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
    alias: {
      process: "process/browser",
    },
    fallback: {
      // If you have other fallbacks, keep them and add the following line
      process: require.resolve("process/browser"),
    },
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  plugins: [
    new webpack.ProvidePlugin({
      process: "process/browser",
    }),
  ],

  externals: {
    react: "React",
    "react-dom": "ReactDOM",
  },
};
