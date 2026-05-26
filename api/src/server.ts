import fastify from 'fastify'
import {
  validatorCompiler,
  serializerCompiler,
  jsonSchemaTransform,
  type ZodTypeProvider
} from 'fastify-type-provider-zod'
import { fastifySwagger } from '@fastify/swagger'
import { fastifyCors } from '@fastify/cors'
import ScalarApiReference from '@scalar/fastify-api-reference'
import { listWebhooks } from './routes/list-webhooks'
import { get } from 'http'
import { getWebhook } from './routes/get-webhook'
import { deleteWebhook } from './routes/delete-webhook'
import { captureWebhook } from './routes/capture-webhook'
import { generateHandler } from './routes/generate-handler'

const app = fastify().withTypeProvider<ZodTypeProvider>()

app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

app.register(fastifyCors, {
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  // credentions: true,
})

app.register(fastifySwagger, {
  openapi: {
    info: {
      title: 'Webhook Inspector API',
      description: 'API for capturing and inspecting webhook requests',
      version: '1.0.0'
    },
  },
  transform: jsonSchemaTransform,
})

app.register(ScalarApiReference, {
  routePrefix: '/docs',
})

app.register(listWebhooks)
app.register(getWebhook)
app.register(deleteWebhook)
app.register(captureWebhook)
app.register(generateHandler)

const port = Number(process.env.PORT) || 3333

app.listen({
  port,
  host: '0.0.0.0',
})
