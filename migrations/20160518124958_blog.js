
exports.up = function(knex, Promise) {
  knex.schema.createTable('users').then((tbl) => {
    tbl.increments('id').primary();
    tbl.string('email');
    tbl.string('username');
    tbl.string('name');
  }).createTable('posts', tbl => {
    tbl.increments('id').primary();
    tbl.string('body');
    tbl.string('title');
    tbl.integer('user_id').references('users.id');
  }).createTable('comments', tbl => {
    tbl.increments('id').primary();
    tbl.string('post_id').references('posts.id');
    tbl.string('user_id').references('users.id');
    tbl.string('body');
  });
};

exports.down = function(knex, Promise) {
  knex.schema.destroyTable('users').destroyTable('posts').destroyTable('comments')
};
