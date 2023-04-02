// eslint-disable-next-line
import { Knex } from "knex";

declare module 'Knex/types/tables' {
  export interface Tables {
    users: {
      name: string
      session_id?: string
      created_at: string
    }
    meals: {
      id: string
      user_session_id: string
      name: string
      description: string
      created_at: string
    }
  }
}
