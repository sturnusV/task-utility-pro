/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema
        .createTable('users', table => {
            table.increments('id').primary();
            table.string('username', 50).unique().notNullable();
            table.string('email', 100).unique().notNullable();
            table.string('password_hash', 255).notNullable();
            table.timestamp('created_at').defaultTo(knex.fn.now());
        })
        .createTable('categories', table => {
            table.increments('id').primary();
            table.string('name', 50).notNullable();
            table.string('color', 20).notNullable();
            table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE');
            table.unique(['name', 'user_id']);
        })
        .createTable('tasks', table => {
            table.increments('id').primary();
            table.string('title', 100).notNullable();
            table.text('description');
            table.date('due_date').notNullable();
            table.enum('priority', ['low', 'medium', 'high']).notNullable();
            table.enum('status', ['todo', 'in_progress', 'done']).notNullable().defaultTo('todo');
            table.timestamp('created_at').defaultTo(knex.fn.now());
            table.timestamp('updated_at').defaultTo(knex.fn.now());
            table.timestamp('completed_at');
            table.integer('category_id').unsigned().references('id').inTable('categories').onDelete('SET NULL');
            table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE');
        });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema
        .dropTableIfExists('tasks')
        .dropTableIfExists('categories')
        .dropTableIfExists('users');
};
