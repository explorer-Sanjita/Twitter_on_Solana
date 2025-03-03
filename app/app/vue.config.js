/* eslint-disable no-undef */
const webpack = require('webpack')
const { defineConfig } = require('@vue/cli-service')

module.exports = {
    transpileDependencies: true,
    configureWebpack: {

        plugins: [
            new webpack.ProvidePlugin({
                Buffer: ['buffer', 'Buffer'],
                process: 'process/browser'
            })
        ],
        resolve: {
            fallback: {
                crypto: false,
                fs: false,
                assert: false,
                process: require.resolve("process/browser"),
                util: require.resolve("util/"),
                path: require.resolve("path-browserify"),
                stream: require.resolve("stream-browserify"),
                http: require.resolve("stream-http"),
                https: require.resolve("https-browserify"),
                zlib: require.resolve("browserify-zlib"),
                url: require.resolve("url/")
            }
        },
    }
}
