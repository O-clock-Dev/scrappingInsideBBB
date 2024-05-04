import { Kysely } from 'kysely'
import { db } from '../core/database'
import { Database, NewStudent, Student } from '../core/types'

export class StudentRepository {
  constructor(private db: Kysely<Database>) {}

  async create(student: NewStudent): Promise<void> {
    await this.db.insertInto('student')
      .values(student)
      .executeTakeFirstOrThrow()
  }

  async updateSlug(id: string, slug: string): Promise<void> {
    await this.db.updateTable('student')
      .set({ slug })
      .where('id', '=', id)
      .execute()
  }

  async findByCohortSlug(slug: string): Promise<Student[]> {
    console.log('slug', slug)
    return await this.db.selectFrom('student as student')
      .innerJoin('cohort as c', 'student.cohort_id', 'c.id')
      .where('c.slug', '=', slug)
      .selectAll("student")
      .execute()
  }

  async findAll(): Promise<Student[]> {
    return await this.db.selectFrom('student')
      .selectAll()
      .execute()
  }
}

