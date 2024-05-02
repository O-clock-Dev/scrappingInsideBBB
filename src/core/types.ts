import {
  ColumnType,
  Generated,
  Insertable,
  JSONColumnType,
  Selectable,
  Updateable,
} from "kysely";

export interface Database {
  cohort: CohortTable;
  student: StudentTable;
}

export interface CohortTable {
  id: Generated<string>;
  name: string | null;
  start_date: ColumnType<Date, string | undefined, never>;
  end_date: ColumnType<Date, string | undefined, never>;
  email: string | null;
  created_at: ColumnType<Date, string | undefined, never>;
}

export type Cohort = Selectable<CohortTable>;
export type NewCohort = Insertable<CohortTable>;
export type UpdateCohort = Updateable<CohortTable>;

export interface StudentTable {
  id: Generated<string>;
  name: string | null;
  github: string | null;
  email: string | null;
  exit: boolean;
  cohort_id: string;
  created_at: ColumnType<Date, string | undefined, never>;
}

export type Student = Selectable<StudentTable>;
export type NewStudent = Insertable<StudentTable>;
export type UpdateStudent = Updateable<StudentTable>;
