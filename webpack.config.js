const path = require("path");
const glob = require("glob");
const webpack = require("webpack");

module.exports = {
  entry: glob
    .sync("./src/**/*.ts", { ignore: "./src/tests/**/*.ts" })
    .reduce((entries, file) => {
      const outputFile = file.replace("./src/", "").replace(".ts", ".js");
      entries[outputFile] = path.resolve(__dirname, file);
      return entries;
    }, {}),
  target: "node",
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
  output: {
    filename: "[name]",
    path: path.resolve(__dirname, "dist"),
    libraryTarget: "commonjs2",
  },
  optimization: {
    minimize: false,
  },
  plugins: [
    new webpack.IgnorePlugin({
      // https://stackoverflow.com/questions/41522744/webpack-import-error-with-node-postgres-pg-client
      resourceRegExp: /^pg-native$/, // Ignore to fix webpack issue
    }),
  ],
};
