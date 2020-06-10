const { resolve } = require('path');

module.exports = {
  mode: 'development',
  entry: resolve(__dirname, 'unit', 'logic.ts'),
  output: {
    filename: 'unit.js',
    path: resolve(__dirname, '..', '_tests'),
  },
  module: {
    rules: [
      {
        test: /\.tsx?/,
        use: {
          loader: 'ts-loader',
          options: {
            configFile: resolve(__dirname, 'tsconfig.json'),
          },
        },
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
};
