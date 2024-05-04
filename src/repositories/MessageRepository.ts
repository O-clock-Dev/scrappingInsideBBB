import { Kysely } from 'kysely'
import { db } from '../core/database'
import { Database, NewMessage } from '../core/types'

export class MessageRepository {
  constructor(private db: Kysely<Database>) {}

  async create(message: NewMessage) {
    await this.db.insertInto('message')
      .values(message)
      .executeTakeFirstOrThrow()
  }
}

