import { randomUUID } from 'crypto'
import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { knex } from '../database'
import { checkSessionIdExists } from '../middlewares/check-session-id-exists'

export async function usersRoutes(app: FastifyInstance) {
  app.get(
    '/',
    {
      preHandler: checkSessionIdExists,
    },
    async (request) => {
      const sessionId = request.cookies.sessionId
      const user = await knex('users').where({
        session_id: sessionId,
      })

      return { user }
    },
  )

  app.post('/', async (request, reply) => {
    const bodySchema = z.object({
      name: z.string(),
    })

    let sessionId = request.cookies.sessionId

    if (!sessionId) {
      sessionId = randomUUID()
      reply.cookie('sessionId', sessionId, {
        path: '/',
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7days
      })
    } else {
      return reply.code(409).send('User already registered')
    }

    const { name } = bodySchema.parse(request.body)

    await knex('users').insert({
      session_id: sessionId,
      name,
    })

    console.log({ name })

    return reply.code(201).send()
  })
}
