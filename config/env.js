const envs = {
    PRODUCTION: {
        ENV_NAME: 'PRODUCTION',
        PORT: process.env.NODE_PORT || 3000,
        DOMAIN: 'api_demo.aguilarcarlos.com',
        IP: '127.0.0.1',
        DATABASE: process.env.DATABASE || 'mongodb://library:sandbox@ds147377.mlab.com:47377/library'
    },

    DEVELOPMENT: {
        ENV_NAME: 'DEVELOPMENT',
        PORT: process.env.NODE_PORT || 8080,
        DOMAIN: 'localhost',
        IP: '127.0.0.1',
        DATABASE: process.env.DATABASE || 'mongodb://library:sandbox@ds147377.mlab.com:47377/library'
    }
}

module.exports = envs[process.env.NODE_ENV || 'DEVELOPMENT'];