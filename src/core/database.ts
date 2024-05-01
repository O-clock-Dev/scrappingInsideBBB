import { Database } from './types'
import { createPool } from "mysql2";
import { Kysely, MysqlDialect } from 'kysely'
import { configDotenv } from 'dotenv';

const envVars = configDotenv().parsed;
if (!envVars) {
  throw new Error("No environment variables found");
}

const dialect = new MysqlDialect({
  pool: createPool({
    host: envVars.DB_HOST,
    user: envVars.DB_USERNAME,
    password: envVars.DB_PASSWORD,
    database: envVars.DB_DATABASE,
    port: parseInt(envVars.DB_PORT, 10),
  }),
})

export const db = new Kysely<Database>({
  dialect,
})

