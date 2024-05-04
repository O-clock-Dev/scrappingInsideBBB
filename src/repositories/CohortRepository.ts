import { Kysely } from 'kysely'
import { db } from '../core/database'
import { Database, NewCohort, Cohort } from '../core/types'

export class CohortRepository {
  constructor(private db: Kysely<Database>) {}

  async create(cohort: NewCohort) {
    await this.db.insertInto('cohort')
      .values(cohort)
      .executeTakeFirstOrThrow()
  }

  async findAll(): Promise<Cohort[]> {
    return await this.db.selectFrom('cohort')
      .selectAll()
      .execute()
  }

  async update(id: string, cohort: NewCohort): Promise<void> {
    await this.db.updateTable('cohort')
      .set(cohort)
      .where('id', '=', id)
      .execute()
  }

  async updateSlug(id: string, slug: string): Promise<void> {
    await this.db.updateTable('cohort')
      .set({ slug })
      .where('id', '=', id)
      .execute()
  }

  async findLikeName(name: string): Promise<Cohort | undefined> {
    return await this.db.selectFrom('cohort')
      .where('name', 'like', `%${name}%`)
      .selectAll()
      .executeTakeFirst()
  }

  async findLikeSlug(slug: string): Promise<Cohort | undefined> {
    return await this.db.selectFrom('cohort')
      .where('slug', 'like', `%${slug}%`)
      .selectAll()
      .executeTakeFirst()
  }
}

