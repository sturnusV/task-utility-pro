/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
  // Deletes ALL existing entries
  await knex('tasks').del();
  await knex('categories').del();
  await knex('users').del();

  // Insert a demo user and get the inserted ID
  const insertedUsers = await knex('users')
    .insert({
      username: 'demo',
      email: 'demo@taskmaster.com',
      password_hash: '$2a$10$examplehash' // Replace with real bcrypt hash in prod
    })
    .returning('id');

  const userId = typeof insertedUsers[0] === 'object'
    ? insertedUsers[0].id
    : insertedUsers[0];

  // Insert a category for that user
  const insertedCategories = await knex('categories')
    .insert({
      name: 'Work',
      color: 'blue',
      user_id: userId
    })
    .returning('id');

  const categoryId = typeof insertedCategories[0] === 'object'
    ? insertedCategories[0].id
    : insertedCategories[0];

  // Insert two demo tasks
  await knex('tasks').insert([
    {
      title: 'Complete project setup',
      description: 'Set up the initial project structure and dependencies',
      due_date: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
      priority: 'high',
      status: 'in_progress',
      user_id: userId,
      category_id: categoryId
    },
    {
      title: 'Design database schema',
      description: 'Create the PostgreSQL schema for the application',
      due_date: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0], // Day after tomorrow
      priority: 'medium',
      status: 'todo',
      user_id: userId
      // category_id is optional
    }
  ]);
};
