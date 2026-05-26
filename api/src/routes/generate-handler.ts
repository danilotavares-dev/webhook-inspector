import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { createSelectSchema } from 'drizzle-zod'
import { z } from 'zod'
import { webhooks } from '@/db/schema'
import { db } from '@/db'
import { inArray } from 'drizzle-orm'
import { generateText } from 'ai'
import { google } from '@ai-sdk/google';

export const generateHandler: FastifyPluginAsyncZod = async (app) => {
  app.post				(
			'/api/generate',
			{
				schema: {
					summary: 'Generate a TypeScipt handler',
					tags: ['Webhooks'],
					body: z.object({
					webhookIds: z.array(z.string()),
					}),
					response: {
						201: z.object({
						  code: z.string(),
						}),
					},
				},
			},
			async (request, reply) => {
				const { webhookIds } = request.body

				const result = await db
  				.select({ body: webhooks.body })
  				.from(webhooks)
  				.where(inArray(webhooks.id, webhookIds))

				const webhooksBodies = result.map(webhook => webhook.body).join('\n\n')

				const { text } = await generateText({
				  model: google('gemini-2.5-flash-lite'),
				  prompt: `
						Generate a TypeScript function that serves as a handler for multiple webhook events. The function should accept a resquest body containing different webhook events.

						The function should handle the following webhook events with the example payloads:

						"""
						${webhooksBodies}
						"""

						The generated code should include:

						- A main function that takes a request body as input.
						- Zod schemas for each event type.
						- Logic to handle each event based on the validated data.
						- appropriate error handling for invalid payloads.

						---

						You can use this prompt to request the TypeScript code you need for handling webhook events with Zod validation.

						Return only the code and do not return \`\`\`typescript or any other markdown symbols, do not include any introduction or text before or after the code.
					`.trim(),
				});

				return reply.status(201).send({ code: text })
			},
		)
}
