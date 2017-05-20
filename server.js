const express = require('express');
const webpack = require('webpack');
const api = require('./api/dist');

const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');

const path = require('path');

const config = require('./webpack.config.js');
const compiler = webpack(config);

const app = express();
const port = process.env.PORT || 3000;

app.use(webpackDevMiddleware(compiler, {
    hot: true,
    historyApiFallback: true
}));

app.use(webpackHotMiddleware(compiler));

app.use(express.static(path.join(__dirname, 'dist')));

app.listen(port, () => {
    console.log('Server listen on: ', port);
});

// api.run();

