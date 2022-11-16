import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { cwd, env } from 'process';

dotenv.config();

export const dataSource = new DataSource({
  type: 'mysql',
  host: env.DB_HOST,
  port: parseInt(env.DB_PORT),
  username: env.DB_USERNAME,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  logging: env.NODE_ENV === 'development',
  entities: ['dist/src/**/entities/*.js'],
  migrationsTableName: 'migration_table',
  migrations: ['dist/database/migrations/*.js'],
});
