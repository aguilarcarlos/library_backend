const path = require('path');
const Router = require('express').Router();
const Book = require(path.resolve('model/Book'));
const Category = require(path.resolve('model/Category'));
const _ = require('lodash');

const getQueryParams = (req) => {
    var params = {};

    params.pageNumber = parseInt(req.query.page) || 0;
    params.pageSize = parseInt(req.query.size) || 20;
    params.order = req.query.order || 'asc';
    params.orderBy = req.query.orderBy || 'name';

    params.limit = params.pageSize;
    params.skip = params.pageNumber ?
        (params.pageNumber - 1) * params.pageSize :
        0;

    return params;
};

const findOrCreate = (Model, search, opts, callBack) => {
    opts = opts || {};

    Model.findOne(search, 'name description', (err, doc) => {
        if (err)
            return callBack(null);
        else if (doc)
            return callBack(doc);
        else
            return callBack(null, search, opts);
    });
};

const hasRequest = (req, requireFields) => {
    req = req || {};
    requireFields = requireFields ? [].concat(requireFields) : [];

    var body = req.body || {},
        fields = Object.keys(body),
        messages = [];

    for (var i = 0, len = requireFields.length; i < len; i++) {
        if (fields.indexOf(requireFields[i]) === -1 ||
            !body[requireFields[i]]) {
            messages.push("The field '" + requireFields[i] + "' is required.");
        }
    }

    if (messages.length) {
        return {
            passed: false,
            messages: messages
        };
    }

    return {
        passed: true,
        messages: [].concat("All passed successfully")
    };

};

Router.route('/books')

    .get((req, res) => {
        var opts = getQueryParams(req),
            sorting = {};

        sorting[opts.orderBy] = opts.order;

        Book.count({}, (err, count) => {
            Book.find()
                .sort(sorting)
                .skip(opts.skip)
                .limit(opts.limit)
                .exec((err, books) => {
                    if (err || !books) {
                        return res.json({
                            error: true,
                            totalSize: 0,
                            message: 'Something wrong happened with this endpoint.',
                            data: []
                        });
                    }

                    return res.json({
                        error: false,
                        pageNumber: opts.pageNumber,
                        totalSize: req.query.size ? opts.pageSize : count,
                        message: 'Retrieving books',
                        data: [].concat(books)
                    });
                });
        });
    })

    .post((req, res) => {

        var requestCheck = hasRequest(req, [
            'name',
            'author',
            'category',
            'published_date'
        ]);

        if (!requestCheck.passed) {
            return res.json({
                error: true,
                message: 'The book cannot be created, please check error messages in \'data\'.',
                data: [].concat(requestCheck.messages)
            });
        }

        var book = new Book();

        book.name = req.body.name ? _.trim(_.escape(req.body.name)) : '';
        book.author = req.body.author ? _.trim(_.escape(req.body.author)) : '';
        book.poster = req.body.poster ? _.trim(_.escape(req.body.poster)) : 'http://lorempixel.com/g/230/300/';
        book.published_date = req.body.published_date || new Date()
            .toISOString()
            .replace(/T/, ' ')
            .replace(/\..+/, '');
        book.user = req.body.user ? _.trim(_.escape(req.body.user)) : '';
        book.category_id = _.kebabCase(req.body.category);
        book.category = req.body.category;

        findOrCreate(Category, {
            short: book.category_id
        }, {
            name: req.body.category,
            short: book.category_id
        }, (category, nCategory, opts) => {
            if (nCategory) {
                var _category = new Category();
                _category.name = opts.name;
                _category.short = opts.short;
                _category.description = 'Auto-generated';
                _category.save();
            }
        });

        book.save(function(err) {
            if (err) {
                return res.json({
                    error: true,
                    message: 'The book cannot be created, please contact to developer.',
                    data: []
                });
            }

            return res.json({
                error: false,
                message: 'Book created successfully',
                data: []
            });
        });
    });

Router.get('/books/category/:category_id', (req, res) => {
    Book.find({category_id: req.params.category_id}, (err, books) => {
        if (err || !books) {
            return res.json({
                error: true,
                message: 'There are not books for this category',
                data: []
            });
        }

        return res.json({
            error: false,
            message: 'Books availables',
            data: [].concat(books)
        });
    });
});

Router.route('/books/:book_id')

    .get((req, res) => {
        Book.findById(req.params.book_id, (err, book) => {
            if (err || !book) {
                return res.json({
                    error: true,
                    message: 'The book was not found.',
                    data: []
                });
            }

            return res.json({
                error: false,
                message: 'Serving book successfully',
                data: [].concat(book)
            });
        });
    })

    .put((req, res) => {
        var requestCheck = hasRequest(req, [
            'name',
            'author',
            'category',
            'published_date'
        ]);

        if (!requestCheck.passed) {
            return res.json({
                error: true,
                message: 'The book cannot be created, please check error messages in \'data\'.',
                data: [].concat(requestCheck.messages)
            });
        }

        var fieldsModified = [];

        Book.findById(req.params.book_id, (err, book) => {
            if (err) {
                return res.json({
                    error: true,
                    message: 'The book not found.',
                    data: []
                });
            }

            if (req.body.name) {
                fieldsModified.push('name');
                book.name = req.body.name;
            }

            if (req.body.author) {
                fieldsModified.push('author');
                book.author = req.body.author;
            }

            if (req.body.category) {
                fieldsModified.push('category');
                book.category = req.body.category;
                book.category_id = _.kebabCase(book.category);

                findOrCreate(Category, {
                    short: book.category_id
                }, {
                    name: req.body.category,
                    short: book.category_id
                }, (category, nCategory, opts) => {
                    if (nCategory) {
                        var _category = new Category();
                        _category.name = opts.name;
                        _category.short = opts.short;
                        _category.description = 'Auto-generated';
                        _category.save();
                    }
                });
            }

            if (req.body.published_date) {
                fieldsModified.push('published_date');
                book.published_date = req.body.published_date;
            }

            if (req.body.user) {
                fieldsModified.push('user');
                book.user = req.body.user;
            }

            if (req.body.poster) {
                fieldsModified.push('poster');
                book.poster = req.body.poster;
            }

            book.save((err) => {
                if (err) {
                    return res.json({
                        error: true,
                        message: 'Something was wrong updating the book.',
                        data: []
                    });
                }

                return res.json({
                    error: false,
                    message: 'Book updated, fields updated: '.concat(fieldsModified.join(', ')),
                    data: [].concat(book)
                });
            });

        });
    })

    .delete((req, res) => {
        var book_id = {_id: req.params.book_id};

        Book.remove(book_id, (err) => {
            if (err) {
                return res.json({
                    error: true,
                    message: 'Something was wrong deleting the book.',
                    data: []
                });
            }

            return res.json({
                error: false,
                message: 'Book successfully deleted',
                data: []
            });
        });
    });

/**
 * Routes for categories
 */
Router.route('/categories')

    .get((req, res) => {
        var opts = getQueryParams(req),
            sorting = {};

        sorting[opts.orderBy] = opts.order;

        Category.count({}, (err, count) => {
            Category.find()
                .sort(sorting)
                .skip(opts.skip)
                .limit(opts.limit)
                .exec((err, categories) => {
                    if (err) {
                        console.log(err);
                        return res.json({
                            error: true,
                            message: 'Something wrong happened with this endpoint.',
                            data: []
                        });
                    }

                    return res.json({
                        error: false,
                        message: 'Displaying all categories registred',
                        pageNumber: opts.pageNumber,
                        totalSize: req.query.size ? opts.pageSize : count,
                        data: [].concat(categories)
                    });
                });
        });
    })
    .post((req, res) => {
        var category = new Category();

        category.name = req.body.name || 'none';
        category.short = _.kebabCase(category.name);
        category.description = req.body.description || 'Auto-generated';

        category.save((err) => {
            if (err) {
                return res.json({
                    error: true,
                    message: 'The category cannot be created, please contact to developer.',
                    data: []
                });
            }

            return res.json({
                error: false,
                message: 'Category created successfully',
                data: []
            });
        });
    });

Router.get('/category/book', (req, res) => {
    Category.find()
        .populate('books')
        .exec((err, categories) => {
            if (err || !books) {
                return res.json({
                    error: true,
                    message: 'Resource not available',
                    data: []
                });
            }

            return res.json({
                error: false,
                message: 'Displaying category and books',
                data: [].concat(categories)
            });
        });
});

Router.get('/categories/:category_id/books', (req, res) => {
    Book.find({category_id: req.params.category_id}, (err, books) => {
        if (err || !books) {
            return res.json({
                error: true,
                message: 'There are not books for this category',
                data: []
            });
        }

        return res.json({
            error: false,
            message: 'Books availables',
            data: [].concat(books)
        });
    });
});



Router.route('/categories/:category_id')

    .get((req, res) => {
        Category.find({short: req.params.category_id}, (err, category) => {
            if (err || !category) {
                return res.json({
                    error: true,
                    message: 'Category not found.',
                    data: []
                });
            }

            return res.json({
                error: false,
                message: 'A category was found',
                data: [].concat(category)
            });
        });
    })

    .put((req, res) => {
        var fieldsModified = [];

        Category.find({short: req.params.category_id}, (err, category) => {
            if (err) {
                return res.json({
                    error: true,
                    message: 'The category was not found.',
                    data: []
                });
            }

            if (req.body.name) {
                fieldsModified.push('name');
                category.name = req.body.name;
            }

            if (req.body.description) {
                fieldsModified.push('description');
                category.description = req.body.description;
            }

            category.save((err) => {
                if (err) {
                    return res.json({
                        error: true,
                        message: 'Something was wrong updating the category.',
                        data: []
                    });
                }

                return res.json({
                    error: false,
                    message: 'Category updated, fields updated: '.concat(fieldsModified.join(', ')),
                    data: [].concat(category)
                });
            });
        });
    })

    .delete((req, res) => {
        var category_id = {_id: req.params.category_id};

        Category.remove(category_id, (err) => {
            if (err) {
                return res.json({
                    error: true,
                    message: 'Something was wrong deleting the category.',
                    data: []
                });
            }

            return res.json({
                error: false,
                message: 'Category successfully deleted',
                data: []
            });
        });
    });

module.exports = {
    router: Router,
    endpoint: '/content'
};