const path = require('path');
const API = require(path.resolve('router/api'));
const Auth = require(path.resolve('services/authService'));
const Env = require(path.resolve('config/env'));

module.exports = (app) => {

    // MIDDLEWARE
    app.use((req, res, next) => {
        var key = Auth.getKey(req);

        if (Auth.check(key)) {
            return next();
        }

        return res.status(403).json({
            error: true,
            message: 'Forbidden content, please use a valid key or contact to developer to get one.',
            data: []
        })
    });

    // ROUTES
    app.use(API.endpoint, API.router);

    app.get('/', (req, res) => {
        res.status(200)
            .json({
                error: false,
                message: "Configuration file",
                data: [
                    {
                        base_url: Env.DOMAIN,
                        api_url: Env.DOMAIN + API.endpoint,
                        paths: {
                            book: "book/{book_id}",
                            books: "books",
                            category: "category/{category_id}",
                            categories: "categories"
                        }
                    }
                ]
            });
    });

    app.get('/*', (req, res) => {
        return res.status(404).json({
            error: true,
            message: 'Not found',
            data: []
        });
    });
};