import * as path from "path";
// import Pool from mysql
import { createPool } from "mysql2";
import { promises as fs } from "fs";
import { Database } from "../core/types";

import { Kysely, Migrator, FileMigrationProvider, MysqlDialect } from "kysely";
import { configDotenv } from "dotenv";

async function migrateToLatest() {

  const envVars = configDotenv().parsed;
  if (!envVars) {
    throw new Error("No environment variables found");
  }

  const db = new Kysely<Database>({
    dialect: new MysqlDialect({
      pool: createPool({
        host: envVars.DB_HOST,
        user: envVars.DB_USERNAME,
        password: envVars.DB_PASSWORD,
        database: envVars.DB_DATABASE,
        port: parseInt(envVars.DB_PORT, 10),
      }),
    }),
  });

  const migrator = new Migrator({
    db,
    provider: new FileMigrationProvider({
      fs,
      path,
      // This needs to be an absolute path.
      migrationFolder: path.join(__dirname, "../migrations"),
    }),
  });

  const { error, results } = await migrator.migrateToLatest();

  results?.forEach((it) => {
    if (it.status === "Success") {
      console.log(`migration "${it.migrationName}" was executed successfully`);
    } else if (it.status === "Error") {
      console.error(`failed to execute migration "${it.migrationName}"`);
    }
  });

  if (error) {
    console.error("failed to migrate");
    console.error(error);
    process.exit(1);
  }

  await db.destroy();
}

migrateToLatest();
