import { publicProcedure, router } from "./trpc"
import { userRouter } from "./routers/user.router"
import { movieRouter } from "./routers/movie.router";


export const appRouter = router({
    user: userRouter,
    movie: movieRouter,
    health: publicProcedure.query(() => ({ status: 'ok' }))
})

export type AppRouter = typeof appRouter;