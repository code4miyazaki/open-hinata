const webpack = require('webpack');

module.exports = {
  //  ビルドしたときのパス 空文字にして相対パスにする。
  baseUrl: process.env.NODE_ENV === 'production'
    ? ''
    : '',
  // vue-awesomeの設定。最適化される？
  transpileDependencies: [
    /\bvue-awesome\b/
  ],
  // performance: {
  //     // デフォルトは244 KiB. 10メガに変更
  //   maxEntrypointSize: 10000000,
  //   maxAssetSize: 10000000
  // }
  // cdnでjqueryを使うとき
  // plugins: [
  //   new webpack.ProvidePlugin(
  //     {
  //       jQuery: "jquery",
  //       $: "jquery",
  //     }
  //   ),
  // ],
}
