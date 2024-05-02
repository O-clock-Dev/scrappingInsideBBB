import { Kysely } from 'kysely'
import { db } from '../core/database'
import { Database, NewStudent } from '../core/types'

export class StudentRepository {
  constructor(private db: Kysely<Database>) {}

  async create(student: NewStudent) {
    await this.db.insertInto('student')
      .values(student)
      .executeTakeFirstOrThrow()
  }
}

