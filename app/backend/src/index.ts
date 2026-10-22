import { Hono } from 'hono'
import { drizzle } from 'drizzle-orm/node-postgres'
import { trpcServer } from '@hono/trpc-server';
import { cors } from 'hono/cors'
import {createTRPCContext} from './trpc/trpc'
import {appRouter} from "./trpc/router"
import 'dotenv/config';


const app = new Hono()

app.get('/', (c) => {
  return c.text('Hello Hono!')
})


app.use("*", cors({
    origin: ['http://localhost:3001', 'http://localhost:3000'],
    credentials: true
}))


app.use(
    '/trpc/*',
    trpcServer({
        router: appRouter,
        createContext: createTRPCContext
    })
)

export default {
  port: Number(process.env.PORT) || 3000,
  fetch: app.fetch,
}