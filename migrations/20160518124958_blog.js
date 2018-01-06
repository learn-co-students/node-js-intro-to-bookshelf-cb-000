exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTableIfNotExists('users', (table) => {
      table.increments('id').primary();
      table.string('name');
      table.string('username');
      table.string('email');
      table.timestamps();
    }),
    knex.schema.createTableIfNotExists('posts', (table) => {
      table.increments().primary();
      table.string('title');
      table.string('body');
      table.integer('author').references('users.id');
      table.timestamps();
    }),
    knex.schema.createTableIfNotExists('comments', (table) => {
      table.increments().primary();
      table.string('body');
      table.integer('user_id').references('users.id');
      table.integer('post_id').references('posts.id');
      table.timestamps();
    })
  ]);
};

exports.down = function(knex, Promise) {
  return knex.schema
    .dropTable('comments')
    .dropTable('posts')
    .dropTable('users');
};
