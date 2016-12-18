const path = require('path');
const express = require('express');
const app = express();
const Env = require(path.resolve('config/env'));

const mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
mongoose.connect(Env.DATABASE);

require(path.resolve('config/express'))(app);
require(path.resolve('router/Router'))(app);

const URL = 'http://' + Env.IP + ':' + Env.PORT;
app.listen(Env.PORT);

console.log('Server on ' + URL);