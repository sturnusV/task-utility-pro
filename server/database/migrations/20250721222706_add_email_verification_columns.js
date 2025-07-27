/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.table('users', (table) => {
    table.boolean('email_verified').defaultTo(false);
    table.string('email_verification_token', 255).nullable();
    table.timestamp('email_verification_token_expires').nullable();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.table('users', (table) => {
    table.dropColumn('email_verified');
    table.dropColumn('email_verification_token');
    table.dropColumn('email_verification_token_expires');
  });
};
