const mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
const Schema = mongoose.Schema;

const BookSchema = new Schema({
    name: String,
    author: String,
    poster: String,
    category_id: String,
    published_date: Date,
    user: String
});

module.exports = mongoose.model('Book', BookSchema);