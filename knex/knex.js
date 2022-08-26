const environment = process.env.NODE_ENV || 'development'; // eslint-disable-line
const config = require('../knexfile.js')[environment];
module.exports = require('knex')(config);