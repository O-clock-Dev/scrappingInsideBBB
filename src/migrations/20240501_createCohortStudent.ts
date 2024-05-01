import { Kysely, sql } from "kysely";

// create table student with mysql and use uuid as primary key
export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable("student")
    // add column id with type string (uuid) and set it as primary key
    .addColumn("id", "varchar(64)", (col) => col.primaryKey())
    .addColumn("first_name", "varchar(255)")
    .addColumn("last_name", "varchar(255)")
    .addColumn("email", "varchar(255)")
    .addColumn("created_at", "timestamp", (col) =>
      col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull()
    )
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable("student").execute();
}
