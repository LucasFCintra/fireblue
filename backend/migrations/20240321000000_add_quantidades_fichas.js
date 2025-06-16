exports.up = function(knex) {
  return knex.schema.alterTable('fichas', function(table) {
    table.integer('quantidade_recebida').notNullable().defaultTo(0);
    table.integer('quantidade_perdida').notNullable().defaultTo(0);
  });
};

exports.down = function(knex) {
  return knex.schema.alterTable('fichas', function(table) {
    table.dropColumn('quantidade_recebida');
    table.dropColumn('quantidade_perdida');
  });
}; 