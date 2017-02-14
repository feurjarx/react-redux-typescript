const express = require('express');
const webpack = require('webpack');

const config = require('./webpack.config.js');
const compiler = webpack(config);

const app = express();

app.use()