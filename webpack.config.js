'use strict'

const path              = require('path')
const autoprefixer      = require('autoprefixer')
const webpack           = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const argv              = require('minimist')(process.argv.slice(2), { boolean:['release'] })
const fs                = require('fs')
process.env.NODE_ENV    = argv.release ? 'production' : 'development'

module.exports = {
  entry: {
    // 'baseApp': ['./src/base.js'],
    // 'pageApp' : ['./src/page.js'],
    'commons': ['react', 'redux-saga', 'react-router']
  },
  output: {
    // libraryTarget: "umd",
    path: path.join(__dirname, 'dist/scripts'),
    filename: '[name].js',
    publicPath: '/scripts/',
    chunkFilename: '[name].chunk.js'
    // chunkFilename: "[name].[hash].js"
  },
  plugins: [
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.optimize.CommonsChunkPlugin({
      name: "commons",
      // chunks: ["indexApp", "pageApp"]
    }),
    new webpack.DefinePlugin({
      // 將 Environment Variables - 環境變數傳入
      'process.env.NODE_ENV': JSON.stringify(argv.release ? 'production' : 'development')
    })
    // new HtmlWebpackPlugin({
    //     release: argv.release,
    //     chunks: ['baseApp'], // 指定對應到的entry為app
    //     filename: 'base.html',
    //     template: './src/template.html',
    //     inject: 'body',
    //     hash: true,
    //     minify: {
    //         minifyCSS: argv.release,
    //         minifyJS: argv.release,
    //         removeComments: argv.release,
    //         collapseWhitespace: argv.release,
    //         preserveLineBreaks: true
    //     }
    // }),
    // new HtmlWebpackPlugin({
    //     release: argv.release,
    //     chunks: ['pageApp'], // 指定對應到的entry為app
    //     filename: 'page.html',
    //     template: './src/template.html',
    //     inject: 'body',
    //     hash: true,
    //     minify: {
    //         minifyCSS: argv.release,
    //         minifyJS: argv.release,
    //         removeComments: argv.release,
    //         collapseWhitespace: argv.release,
    //         preserveLineBreaks: true
    //     }
    // })
  ],
  module: {
    loaders: [
      {
        test: /\.js$/,
        loader: 'babel',
        exclude: /(node_modules|bower_components)/,
        include: [ path.join(__dirname, 'src'), path.join(__dirname, 'lib') ],
        query: {
          presets: ['es2015', 'stage-0', 'react'],
          plugins: ['babel-plugin-transform-decorators-legacy'],
          env: {
            development: {
              presets: ['react-hmre']
            }
          }
        }
      }, {
        test: /\.(css|scss)$/,
        loaders: ['style', 'css', 'postcss', 'sass']
      }, {
        test: /\.(jpe?g|png|gif|svg)$/i,
        loaders: [
          // 'url?limit=10000&name=[path][name].[ext]',
          'url?name=[path][name].[ext]',
          'img?minimize&optimizationLevel=5&progressive=true'
        ]
      }, {
        test: /\.json$/,
        loaders: ['json']
      }
    ]
  },
  resolve: {
    modulesDirectories: [
      'node_modules',
      'lib',
      'src'
    ],
    extensions: ['', '.js', '.jsx', '.css', '.scss', '.ts', '.tsx']
  },
  postcss: [ autoprefixer({ browsers: ['last 2 versions'] }) ],
  sassLoader: {
    includePaths: [path.resolve(__dirname, "./src/assets/sass")]
  }
}

// 指定./src/*.js為Bundle Entry
fs.readdirSync(__dirname + '/src').forEach(function (file) {
  if (fs.statSync(path.join(__dirname + '/src', file)).isFile()) {
    if(/.js$/.test(file)) {
      let fileName = file.replace(/.js$/, '')
      module.exports.entry[`${fileName}App`] = [`./src/${fileName}.js`]
    }
  }
})


if(argv.release) {
  module.exports.plugins.unshift(
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings    : false,
        dead_code   : true,
        drop_console: true
      }
    }),
    new webpack.optimize.DedupePlugin()
  )
} else {
  module.exports.plugins.unshift(
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin()
  )
}
