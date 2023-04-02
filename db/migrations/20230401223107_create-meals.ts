import { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('meals', (table) => {
    table.uuid('id').primary()
    table.integer('user_session_id').unsigned()
    table.foreign('user_session_id').references('session_id').inTable('users')
    table.text('name').notNullable()
    table.text('description').notNullable()
    table.boolean('diet').notNullable()
    table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable()
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('meals')
}
