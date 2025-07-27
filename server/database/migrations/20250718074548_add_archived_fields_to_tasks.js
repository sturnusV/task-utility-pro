/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.alterTable('tasks', table => {
    table.boolean('is_archived').defaultTo(false);
    table.timestamp('archived_at').nullable();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.alterTable('tasks', table => {
    table.dropColumn('is_archived');
    table.dropColumn('archived_at');
  });
};
