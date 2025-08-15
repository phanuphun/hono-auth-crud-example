import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { ensureUserTableExists } from './db/knexEnsureTable.js'
import { serveStatic } from '@hono/node-server/serve-static'
import { logger } from 'hono/logger'
import { cors } from 'hono/cors'
import { csrf } from 'hono/csrf'
import authorization from './middlewares/authorization.js'

const app = new Hono({ strict: false })
const api = new Hono()
export const DIRNAME = import.meta.dirname

app.use(logger())
app.use(cors())

app.use('/static/*', serveStatic({ root: DIRNAME }))

app.get('/', (c) => {
  return c.json({
    service: 'Prepaid API Mocking',
    version: '1.0.0',
    status: 'running'
  })
})

import userRoute from './routers/users.js'
import authRoute from './routers/auth.js'
api.use('/users/*', authorization);
api.route('/users', userRoute)
api.route('/auth', authRoute)

app.route('/api/v1', api)

// Knex
await ensureUserTableExists();

serve({
  fetch: app.fetch,
  port: 3000
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})
