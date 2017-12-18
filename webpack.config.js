const webpack = require('webpack');
const UglifyJsPlugin = webpack.optimize.UglifyJsPlugin;
const path = require('path');
const env = require('yargs').argv.env;

const
  libraryName = 'underhand',
  libraryVarName = 'Underhand';

let
  plugins = [],
  libraryOutputFile = libraryName + '.js';


if (env === 'build') {
  plugins.push(new UglifyJsPlugin({ minimize: true }));
  libraryOutputFile = libraryName + '.min.js';
}


var libConfig = {
  entry: __dirname + '/lib/index.js',
  devtool: 'source-map',
  output: {
    filename: libraryOutputFile,
    path: __dirname + '/dist',
    library: libraryVarName,
    libraryTarget: 'window'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        loader: 'babel-loader'
      },
      {
        test: /(\.jsx|\.js)$/,
        loader: "eslint-loader",
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    modules: [path.resolve('./node_modules'), path.resolve('./lib')],
    extensions: ['.json', '.js']
  },
  plugins: plugins
};

var elmConfig = {
  entry: __dirname + '/elm/Main.elm',
  devtool: 'source-map',
  output: {
    filename: 'elmapp.js',
    path: __dirname + '/dist',
    library: 'ElmApp',
    libraryTarget: 'window'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        loader: 'babel-loader'
      },
      {
        test: /(\.jsx|\.js)$/,
        loader: "eslint-loader",
        exclude: /node_modules/
      },
      {
        test: /\.elm$/,
        exclude: [/elm-stuff/, /node_modules/],
        use: {
          loader: 'elm-webpack-loader',
          options: { }
        }
      }
    ]
  },
  resolve: {
    modules: [path.resolve('./node_modules'), path.resolve('./elm')],
    extensions: ['.json', '.js']
  },
  plugins: plugins
};


module.exports = [
  libConfig, elmConfig
];
