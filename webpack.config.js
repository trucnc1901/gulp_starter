const path = require('path');
const outputDir = path.resolve(__dirname, '/public/js');
module.exports = {
  // entry: './src/components/foo.js',
  output: {
    path: outputDir,
    filename: 'bundle.js',
    
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".jsx"]
  },
  module: {
    rules: [{
      test: /\.js$/,
      exclude: /node_modules/,
      use: ['babel-loader']
    }]
  }
};