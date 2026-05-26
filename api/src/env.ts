import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3333),
  GOOGLE_GENERATIVE_AI_API_KEY: z.string(),
  DATABASE_URL: z.url(),
})

export const env = envSchema.parse(process.env)
