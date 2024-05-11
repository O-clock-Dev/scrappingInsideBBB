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
  course: CourseTable;
  message: MessageTable;
}

export interface CohortTable {
  id: Generated<string>;
  name: string | null;
  slug: string | null;
  start_date: ColumnType<Date, string | undefined, never>;
  end_date: ColumnType<Date, string | undefined, never>;
  email: string | null;
  created_at: ColumnType<Date, string | undefined, never>;
  cockpit_id: string | null;
}

export type Cohort = Selectable<CohortTable>;
export type NewCohort = Insertable<CohortTable>;
export type UpdateCohort = Updateable<CohortTable>;

export interface StudentTable {
  id: Generated<string>;
  fullName: string | null;
  lastName: string | null;
  firstName: string | null;
  slug: string | null;
  github: string | null;
  email: string | null;
  exit: boolean;
  cohort_id: string;
  created_at: ColumnType<Date, string | undefined, never>;
}

export type Student = Selectable<StudentTable>;
export type NewStudent = Insertable<StudentTable>;
export type UpdateStudent = Updateable<StudentTable>;

export interface CourseTable {
  id: Generated<string>;
  meetingId: string | null;
  name: string | null;
  reportId: string | null;
  dashboardUrl: string | null;
  replayUrl: string | null;
  creation_date: ColumnType<Date, string | undefined, never>;
  end_date: ColumnType<Date, string | undefined, never>;
  cohort_id: string;
  created_at: ColumnType<Date, string | undefined, never>;
}

export type Course = Selectable<CourseTable>;
export type NewCourse = Insertable<CourseTable>;
export type UpdateCourse = Updateable<CourseTable>;

export interface MessageTable {
  id: Generated<string>;
  timestamp: string;
  timestampFromStartDate: ColumnType<Date, string | undefined, never>;
  message: string | null;
  course_id: string;
  student_id: string | null;
  cohort_id: string;
  content: string | null;
  created_at: ColumnType<Date, string | undefined, never>;
}

export type Message = Selectable<MessageTable>;
export type NewMessage = Insertable<MessageTable>;
export type UpdateMessage = Updateable<MessageTable>;
