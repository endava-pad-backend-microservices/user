require('dotenv').config()

const config = 
{
    "type": "postgres",
    "host": process.env.PG_HOSTNAME,
    "port": 5432,
    "username": process.env.PG_USER,
    "password": process.env.PG_PASSWORD,
    "database": process.env.PG_DATABASE,
    "synchronize": true,
    "logging": true,
    "entities": ["src/persistence/entity/**/*.ts"],
    "migrations": ["src/persistencemigration/**/*.ts"],
    "subscribers": ["src/persistence/subscriber/**/*.ts"],
    "cli": {
      "entitiesDir": "src/persistence/entity",
      "migrationsDir": "src/persistence/migration",
      "subscribersDir": "src/persistence/subscriber"
    }
  }

  module.exports = config