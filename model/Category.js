const mongoose = require('mongoose');
mongoose.Promise = require('bluebird');

const Schema = mongoose.Schema;

const CategorySchema = new Schema({
    name: String,
    short: String,
    description: String
}, { toJSON: { virtuals: true } });

CategorySchema.virtual('books', {
    ref: 'Book',
    localField: 'short',
    foreignField: 'category_id'
});

module.exports = mongoose.model('Category', CategorySchema);

