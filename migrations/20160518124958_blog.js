
exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTableIfNotExists('users',function(t){
      t.increments('id').primary();
      t.string('name').notNull();
      t.string('email').notNull();
      t.string('username').notNull();
      t.timestamps();
    }),
    knex.schema.createTableIfNotExists('posts',function(t){
      t.increments('id').primary();
      t.string('title');
      t.string('body');
      t.integer('author').references('users.id');
      t.timestamps();
    }),
    knex.schema.createTableIfNotExists('comments', (t) => {
         t.increments().primary();
         t.string('body');
         t.integer('user_id').references('users.id');
         t.integer('post_id').references('posts.id');
         t.timestamps();
    })
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema
      .dropTable('comments')
      .dropTable('posts')
      .dropTable('users')
    ]);
};
