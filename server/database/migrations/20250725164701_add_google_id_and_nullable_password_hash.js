/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.alterTable('users', function (table) {
        // Add the google_id column
        // It should be a string, unique (one Google ID per user), and nullable
        // because not all users will sign in with Google.
        table.string('google_id', 255).unique().nullable();

        // Make the password_hash column nullable
        // This allows users who sign in via Google to exist without a traditional password.
        // If you have existing non-null password_hash values, this operation will succeed.
        // If you had a NOT NULL constraint, this will remove it.
        table.string('password_hash', 255).nullable().alter(); // Use .alter() to modify existing column
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.alterTable('users', function (table) {
        // In the down migration, reverse the changes.
        // Drop the google_id column.
        table.dropColumn('google_id');

        // Revert password_hash to NOT NULL if it was originally designed to be so.
        // IMPORTANT: If you have existing rows with NULL password_hash after running 'up',
        // this 'down' migration will fail unless you handle those NULLs (e.g., set a default, or clear data).
        // For a production system, carefully consider the implications of reverting NOT NULL.
        // For development, this is usually fine.
        table.string('password_hash', 255).notNullable().alter();
    });
};
