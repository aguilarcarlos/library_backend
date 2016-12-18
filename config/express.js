const path = require('path');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const helmet = require('helmet');
const methodOverride = require('method-override');
const compression = require('compression');

module.exports = (app) => {
    app.set('trust proxy', 1);
    app.use(helmet());
    app.disable('x-powered-by');
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());
    app.use(morgan('common'));
    app.use(methodOverride());
    app.use(compression());
};