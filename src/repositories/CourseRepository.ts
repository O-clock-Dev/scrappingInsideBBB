import { Kysely } from 'kysely'
import { db } from '../core/database'
import { Database, NewCourse } from '../core/types'

export class CourseRepository {
  constructor(private db: Kysely<Database>) {}

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
}

