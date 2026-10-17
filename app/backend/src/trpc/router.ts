import { publicProcedure, router } from "./trpc"
import { userRouter } from "./routers/user.router"


export const appRouter = router({
    user: userRouter,
    health: publicProcedure.query(() => ({ status: 'ok' }))
})

export type AppRouter = typeof appRouter;