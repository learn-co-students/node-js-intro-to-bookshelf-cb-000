// Update with your config settings.

module.exports = {

  testing: {
    client: 'postgresql',
    connection: {
      database: 'blogdb'
    },
    pool: {
      min:2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations_test'
    }
  },

  development: {
    client: 'postgresql',
    connection: {
      database: 'blogdb',
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations_dev'
    }
  },

};
