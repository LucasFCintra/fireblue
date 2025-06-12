exports.up = function(knex) {
  return knex.schema.createTable('recebimentos_parciais', function(table) {
    table.increments('id').primary();
    table.integer('ficha_id').notNullable();
    table.integer('quantidade_recebida').notNullable();
    table.integer('quantidade_restante').notNullable();
    table.text('observacoes');
    table.timestamp('data_recebimento').notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    table.foreign('ficha_id').references('id').inTable('fichas');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('recebimentos_parciais');
}; 