import { publicProcedure, router } from "./trpc"
import { userRouter } from "./routers/user.router"
import { movieRouter } from "./routers/movie.router";
import { genreRouter } from "./routers/genre.router";
import { hallRouter } from "./routers/hall.router";


export const appRouter = router({
    user: userRouter,
    movie: movieRouter,
    genre: genreRouter,
    hall: hallRouter,
    health: publicProcedure.query(() => ({ status: 'ok' }))
})

export type AppRouter = typeof appRouter;