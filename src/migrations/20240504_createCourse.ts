import { Kysely, sql } from "kysely";

// create table course with mysql and use uuid as primary key
export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('course')
    .addColumn('id', "varchar(64)", (col) => col.primaryKey())
    .addColumn('name', 'varchar(255)')
    .addColumn('meetingId', 'varchar(255)')
    .addColumn("reportId", "varchar(255)")
    .addColumn("dashboardUrl", "varchar(255)")
    .addColumn("replayUrl", "varchar(255)")
    .addColumn("creation_date", "timestamp")
    .addColumn("end_date", "timestamp")
    .addColumn("cohort_id", "varchar(64)", (col) =>
      col.references('cohort.id').onDelete('cascade').notNull()
    )
    .addColumn("created_at", "timestamp", (col) =>
      col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull()
    )
    .execute()

  await db.schema
    .createIndex('course_cohort_id_index')
    .on('course')
    .column('cohort_id')
    .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable("course").execute();
}
