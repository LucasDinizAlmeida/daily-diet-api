import { randomUUID } from 'crypto'
import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { knex } from '../database'
import { checkSessionIdExists } from '../middlewares/check-session-id-exists'

export async function mealsRoutes(app: FastifyInstance) {
  app.get(
    '/',
    {
      preHandler: checkSessionIdExists,
    },
    async (request) => {
      const sessionId = request.cookies.sessionId
      const meals = await knex('meals').where('user_session_id', sessionId)

      // const meals = await knex('meals').select('*')

      return { meals }
    },
  )
  app.get(
    '/metrics',
    {
      preHandler: checkSessionIdExists,
    },
    async (request) => {
      const sessionId = request.cookies.sessionId

      const meals = await knex('meals')
        .where({
          user_session_id: sessionId,
        })
        .orderBy('created_at', 'asc')
        .select('diet', 'created_at')

      let maxSequence = 0
      let currentSequence = 0

      for (let i = 0; i < meals.length; i++) {
        if (meals[i].diet === 1) {
          currentSequence++
          if (currentSequence > maxSequence) {
            maxSequence = currentSequence
          }
        } else {
          currentSequence = 0
        }
      }

      const totalMelas = meals.length

      const contador = meals.reduce(
        (contador, elemento) => {
          if (elemento.diet === 0) {
            contador.dietFalse += 1
          } else if (elemento.diet === 1) {
            contador.dietTrue += 1
          }
          return contador
        },
        { dietFalse: 0, dietTrue: 0 },
      )

      const { dietTrue, dietFalse } = contador

      return { metrics: { totalMelas, dietTrue, dietFalse, maxSequence } }
    },
  )
  app.put(
    '/:id',
    {
      preHandler: checkSessionIdExists,
    },
    async (request, reply) => {
      const sessionId = request.cookies.sessionId

      const bodySchema = z.object({
        name: z.string(),
        description: z.string(),
        diet: z.boolean(),
      })

      const { name, description, diet } = bodySchema.parse(request.body)

      const getTransactionParamsSchema = z.object({
        id: z.string().uuid(),
      })

      const { id } = getTransactionParamsSchema.parse(request.params)

      await knex('meals')
        .where({
          user_session_id: sessionId,
          id,
        })
        .update({
          name,
          description,
          diet,
        })

      return reply.code(204).send()
    },
  )
  app.delete(
    '/:id',
    {
      preHandler: checkSessionIdExists,
    },
    async (request, reply) => {
      const sessionId = request.cookies.sessionId

      const getTransactionParamsSchema = z.object({
        id: z.string().uuid(),
      })

      const { id } = getTransactionParamsSchema.parse(request.params)

      await knex('meals')
        .where({
          user_session_id: sessionId,
          id,
        })
        .delete()

      return reply.code(204).send()
    },
  )
  app.get(
    '/:id',
    {
      preHandler: checkSessionIdExists,
    },
    async (request) => {
      const sessionId = request.cookies.sessionId

      const getTransactionParamsSchema = z.object({
        id: z.string().uuid(),
      })

      const { id } = getTransactionParamsSchema.parse(request.params)

      const meal = await knex('meals').where({
        user_session_id: sessionId,
        id,
      })

      return { meal }
    },
  )

  app.post(
    '/',
    {
      preHandler: checkSessionIdExists,
    },
    async (request, reply) => {
      const bodySchema = z.object({
        name: z.string(),
        description: z.string(),
        diet: z.boolean(),
      })

      const sessionId = request.cookies.sessionId

      const { name, description, diet } = bodySchema.parse(request.body)

      await knex('meals').insert({
        id: randomUUID(),
        user_session_id: sessionId,
        description,
        diet,
        name,
      })

      // console.log({ name })

      return reply.code(201).send()
    },
  )
}
