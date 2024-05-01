import {
  ColumnType,
  Generated,
  Insertable,
  JSONColumnType,
  Selectable,
  Updateable,
} from "kysely";

export interface Database {
  student: StudentTable;
}

export interface StudentTable {
  id: Generated<string>;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  created_at: ColumnType<Date, string | undefined, never>;
}

export type Student = Selectable<StudentTable>;
export type NewStudent = Insertable<StudentTable>;
export type UpdateStudent = Updateable<StudentTable>;
