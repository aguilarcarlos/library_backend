const mongoose = require('mongoose');
mongoose.Promise = require('bluebird');

const Schema = mongoose.Schema;

const CategorySchema = new Schema({
    name: String,
    description: String
});

module.exports = mongoose.model('Category', CategorySchema);