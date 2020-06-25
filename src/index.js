const fetchDownloads = require('./fetch-downloads');
// eslint-disable-next-line no-global-assign
Promise = require('bluebird');

const server = require('./server');

fetchDownloads();

const src = server;

module.exports = src;
