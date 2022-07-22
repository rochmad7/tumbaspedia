const ORMConfig = {
  type: `postgres`,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  logging: process.env.NODE_ENV === 'development',
  entities: ['dist/src/**/entities/*.js'],
  migrationsTableName: 'migration_table',
  migrations: ['dist/database/migrations/*.js'],
  seeds: ['dist/database/seeds/*.js'],
  cli: {
    migrationsDir: 'database/migrations',
  },
};

module.exports = ORMConfig;
