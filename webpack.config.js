const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

module.exports = {
    entry: {
        bundle: [
            'webpack-dev-middleware/client',
            'webpack/hot/only-dev-server',
            'react-hot-loader/patch',
            'lodash',
            path.join(__dirname, './src/index.tsx')
        ]
    },

    output: {
        path: path.join(__dirname, './dist'),
        filename: '[name].js',
        publicPath: '/'
    },

    resolve: {
        extensions: ['', '.ts', '.tsx', '.js', '.jsx']
    },

    module: {
        loaders: [{
            test: /\.(ts|tsx)$/,
            loaders: ['react-hot-loader/webpack', 'ts']
        }],

        preLoaders: [{
            test: /\.js$/,
            loaders: ['source-map']
        }]
    },

    plugins: [
        new HtmlWebpackPlugin({
            template: path.join(__dirname, './src/index.html')
        }),
    ]
}
