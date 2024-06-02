import { Kysely } from 'kysely'
import { db } from '../core/database'
import { Course, Database, NewCourse } from '../core/types'

export class CourseRepository {
  constructor(private db: Kysely<Database>) {}

  async findAll(): Promise<Course[]> {
    return await this.db.selectFrom('course')
      .selectAll()
      .execute()
  }

  async create(course: NewCourse) {
    await this.db.insertInto('course')
      .values(course)
      .executeTakeFirstOrThrow()
  }

  async findByMeetingId(meetingId: string) {
    return await this.db.selectFrom('course')
      .where('meetingId', '=', meetingId)
      .selectAll()
      .executeTakeFirstOrThrow()
  }

  // la date doit être au format YYYY-mm-dd
  async findByCohortIdAndDate(cohortId: string, creationDate: string) {
    return await this.db.selectFrom('course')
      .where('cohort_id', '=', cohortId)
      .where('name', 'like', `%${creationDate}%`)
      .selectAll()
      .executeTakeFirst()
  }
}

