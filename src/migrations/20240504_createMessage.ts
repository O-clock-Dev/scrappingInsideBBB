import { Kysely, sql } from "kysely";

// create table course with mysql and use uuid as primary key
export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('message')
    .addColumn('id', "varchar(64)", (col) => col.primaryKey())
    .addColumn("timestamp", "varchar(255)")
    .addColumn("timestampFromStartDate", "timestamp")
    .addColumn("message", "text")
    .addColumn('course_id', 'varchar(64)', (col) =>
      col.references('course.id').onDelete('cascade').notNull()
    )
    .addColumn('student_id', 'varchar(64)', (col) =>
      col.references('student.id').onDelete('cascade')
    )
    .addColumn("cohort_id", "varchar(64)", (col) =>
      col.references('cohort.id').onDelete('cascade').notNull()
    )
    .addColumn("created_at", "timestamp", (col) =>
      col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull()
    )
    .execute()

  await db.schema
    .createIndex('message.course_id_index')
    .on('message')
    .column('course_id')
    .execute()
  await db.schema
    .createIndex('message.student_id_index')
    .on('message')
    .column('student_id')
    .execute()
  await db.schema
    .createIndex('message_cohort_id_index')
    .on('message')
    .column('cohort_id')
    .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable("message").execute();
}
