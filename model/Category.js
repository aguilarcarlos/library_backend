const mongoose = require('mongoose');
mongoose.Promise = require('bluebird');

const Schema = mongoose.Schema;

const CategorySchema = new Schema({
    name: String,
    short: String,
    description: String
});

module.exports = mongoose.model('Category', CategorySchema);