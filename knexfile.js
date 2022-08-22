// Update with your config settings.

/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
module.exports = {

  development: {
    client: 'sqlite3',
    connection: {
      filename: './dev.sqlite3'
    },
    migrations: {
      directory: __dirname + '/knex/migrations',
    },
  },

  staging: {
    client: 'postgresql',
    connection: process.env.HEROKU_POSTGRESQL_JADE_URL,
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations',
      directory: __dirname + '/knex/migrations'
    }
  },

  production: {
    client: 'postgresql',
    connection: process.env.HEROKU_POSTGRESQL_JADE_URL,
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations',
      directory: __dirname + '/knex/migrations'
    }
  }

};
