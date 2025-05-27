var knex = require('knex')({
    client: 'mysql2',
    connection: {
      host : '26.119.98.11',
      user : 'root',
      password : '',
      database : 'fireblue'
    }
  });

module.exports = knex