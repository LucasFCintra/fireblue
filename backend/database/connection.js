var knex = require('knex')({
    client: 'mysql2',
    connection: {
      host : '192.168.15.30',
      user : 'root',
      password : '',
      database : 'fireblue'
    }
  });

module.exports = knex