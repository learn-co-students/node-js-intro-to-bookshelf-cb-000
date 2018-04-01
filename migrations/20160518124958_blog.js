exports.up = (knex, Promise) => {
  return knex.schema.createTable('users', table => {
    table.increments('id').primary();
    table.string('name');
    table.string('email');
    table.string('username');
    table.timestamps();
  }).createTable('posts', table => {
    table.increments('id').primary();
    table.string('title');
    table.string('body');
    table.integer('author').references('users.id');
    table.timestamps();
  }).createTable('comments', table => {
    table.increments('id').primary();
    table.string('body');
    table.integer('user_id').references('users.id');
    table.integer('post_id').references('posts.id');
    table.timestamps();
  });
}
exports.down = (knex, Promise) => knex.schema.dropTable('users')
  .dropTable('posts').dropTable('comments');
