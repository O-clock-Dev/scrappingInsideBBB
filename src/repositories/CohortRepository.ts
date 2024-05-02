import { Kysely } from 'kysely'
import { db } from '../core/database'
import { Database, NewCohort } from '../core/types'

export class CohortRepository {
  constructor(private db: Kysely<Database>) {}

  async create(cohort: NewCohort) {
    await this.db.insertInto('cohort')
      .values(cohort)
      .executeTakeFirstOrThrow()
  }
}

