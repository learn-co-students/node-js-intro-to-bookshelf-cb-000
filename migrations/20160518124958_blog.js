
exports.up = function(knex, Promise) {
	return Promise.all([
		knex.schema.createTable('users', (tbl) => {
				tbl.increments('id').primary();
				tbl.string('name');
				tbl.string('email');
				tbl.string('username');
				tbl.timestamps();
			}),

		knex.schema.createTable('posts', (tbl) => {
			tbl.increments().primary();
			tbl.string('title');
			tbl.string('body');
			tbl.integer('author').references('users.id');
			tbl.timestamps();
		}),

		knex.schema.createTable('comments', (tbl) => {
			tbl.increments().primary();
			tbl.integer('user_id').references('users.id');
			tbl.integer('post_id').references('posts.id');
			tbl.string('body');
			tbl.timestamps();
		})
	]);
};

exports.down = function(knex, Promise) {
	return knex.schema
	    .dropTable('comments')
	    .dropTable('posts')
	    .dropTable('users');
		};
