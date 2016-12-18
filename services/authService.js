const keys = require('../../appKeys/keys.json');

module.exports = {
    check: (key) => {
        return keys.valids.indexOf(key) > -1;
    },

    getKey: (req) => {
        return req.headers['app-key'] ||
            req.headers['appKey'] ||
            req.headers['key'] ||
            req.query.appKey ||
            req.query.key || null;
    }
};
