require('dotenv').config()

const config = 
{
    "type": "postgres",
    "host": process.env.POSTGRES_HOSTNAME,
    "port": 5432,
    "username": process.env.POSTGRES_USER,
    "password": process.env.POSTGRES_PASSWORD,
    "database": process.env.POSTGRES_DB,
    "synchronize": true,
    "logging": true,
    "entities": ["src/persistence/entity/**/*.ts"],
    "migrations": ["src/persistence/migration/**/*.ts"],
    "subscribers": ["src/persistence/subscriber/**/*.ts"],
    "cli": {
      "entitiesDir": "src/persistence/entity",
      "migrationsDir": "src/persistence/migration",
      "subscribersDir": "src/persistence/subscriber"
    }
  }

  module.exports = config