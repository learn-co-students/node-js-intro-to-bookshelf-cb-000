// Update with your config settings.

module.exports = {

  testing: {
    client: 'postgresql',
    connection: {
      host : '127.0.0.1',
      user : 'postgres',
      password : 'postgres',
      database: 'postgres'
    },
    pool: {
      min:2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  },

  development: {
    client: 'postgresql',
    connection: {
      database: 'learnco_blog',
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  },

};
