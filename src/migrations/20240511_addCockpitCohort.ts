import { Kysely, sql } from "kysely";

// create table student with mysql and use uuid as primary key
export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable('cohort')
    .addColumn('cockpit_id', 'varchar(255)')
    .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.alterTable("cohort").dropColumn("cockpit_id").execute();
}
