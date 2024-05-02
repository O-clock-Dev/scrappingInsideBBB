import { Kysely, sql } from "kysely";

// create table student with mysql and use uuid as primary key
export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('cohort')
    .addColumn('id', "varchar(64)", (col) => col.primaryKey())
    .addColumn('name', 'varchar(255)')
    .addColumn("start_date", "timestamp")
    .addColumn("end_date", "timestamp")
    .addColumn("created_at", "timestamp", (col) =>
      col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull()
    )
    .execute()

  await db.schema
    .createTable("student")
    // add column id with type string (uuid) and set it as primary key
    .addColumn("id", "varchar(64)", (col) => col.primaryKey())
    .addColumn("name", "varchar(255)")
    .addColumn("github", "varchar(255)")
    .addColumn("email", "varchar(255)")
    .addColumn("exit", "boolean", (col) => col.defaultTo(false))
    .addColumn('cohort_id', 'varchar(64)', (col) =>
      col.references('cohort.id').onDelete('cascade').notNull()
    )
    .addColumn("created_at", "timestamp", (col) =>
      col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull()
    )
    .execute();

  await db.schema
    .createIndex('student_cohort_id_index')
    .on('student')
    .column('cohort_id')
    .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable("student").execute();
  await db.schema.dropTable("cohort").execute();
}
