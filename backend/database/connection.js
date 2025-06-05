var knex = require('knex')({
    client: 'mysql2',
    connection: {
      host : '26.203.75.236',
      user : 'root',
      password : '',
      database : 'fireblue'
    }
  });

module.exports = knex