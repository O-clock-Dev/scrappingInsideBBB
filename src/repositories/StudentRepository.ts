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

  async updateSlug(id: string, slug: string) {
    await this.db.updateTable('student')
      .set({ slug })
      .where('id', '=', id)
      .execute()
  }

  async findAll() {
    return await this.db.selectFrom('student')
      .selectAll()
      .execute()
  }
}

