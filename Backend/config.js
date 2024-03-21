// config.js
const dotenv = require('dotenv');
dotenv.config();

const {
    PORT,
    HOST,
    HOST_URL
} = process.env;

module.exports = {
    port: PORT,
    host: HOST,
    hostUrl: HOST_URL
};
