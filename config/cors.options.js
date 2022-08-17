const whitelist = require('./allowed-origins.options');

const corsOptions = {
    origin: (origin, callback) => {
        if(whitelist.indexOf(origin) !== -1 || !origin) {
            callback(null, true);
        } else {
            callback(new Error('Access Denied by CORS'));
        }
    },
    optionsSuccessStatus: 200
}

module.exports = corsOptions;