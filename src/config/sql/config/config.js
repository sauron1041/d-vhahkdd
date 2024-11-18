require('dotenv').config();

const config = {
  "development": {
    "username": process.env.DATABASE_USERNAME,
    "password": process.env.DATABASE_PASSWORD,
    "database": process.env.DATABASE_NAME,
    "host": process.env.DATABASE_HOST,
    "dialect": process.env.DIALECT,
    "port": process.env.DATABASE_PORT,
    "query": {
      "raw": true
    },
    "logging": false,
    "define": {
      timestamps: true,
      freezeTableName: true,
    },
    "timezone": "+07:00"

  },
  "test": {
    "username": "root",
    "password": null,
    "database": "database_test",
    "host": "127.0.0.1",
    "dialect": "mysql"
  },
  "production": {
    "username": "root",
    "password": null,
    "database": "database_production",
    "host": "127.0.0.1",
    "dialect": "mysql"
  }
}

module.exports = config;