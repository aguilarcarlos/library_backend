const path = require('path');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const helmet = require('helmet');
const methodOverride = require('method-override');
const compression = require('compression');
const cors = require('cors');

module.exports = (app) => {
    var corsOptions = {
        origin: (origin, callback) => {
            var allowedOrigins = [
                'http://localhost:8080',
                'http://localhost:3000',
                'http://app1.demo.aguilarcarlos.com',
                'https://localhost:8080',
                'https://localhost:3000',
                'https://app1.demo.aguilarcarlos.com'
            ];

            if (allowedOrigins.indexOf('*') > -1)
            {
                return callback(null, '*');
            }

            return callback(null, allowedOrigins.indexOf(origin) > -1);
        },
        methods: ['GET', 'PUT', 'POST', 'DELETE']
    };

    app.set('trust proxy', 1);
    app.use(helmet());
    app.use(cors(corsOptions));
    app.disable('x-powered-by');
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());
    app.use(morgan('common'));
    app.use(methodOverride());
    app.use(compression());
};