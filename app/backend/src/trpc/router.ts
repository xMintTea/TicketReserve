import {z} from "zod"
import { publicProcedure, router } from "./trpc"
import { users } from "../db/schema"
import { eq } from "drizzle-orm"


export const userRouter = router({
    getById: publicProcedure
        .input(z.object({ id: z.number()}))
        .query(async ({ctx, input}) => {
            const [user] = await ctx.db.select().from(users).where(eq(users.id, input.id))
            if (!users) {
                throw new Error("User not found")
            }
            const {passwordHash, ...safeUser} = user;
            return safeUser;
        })
})



export const appRouter = router({
    user: userRouter,
    health: publicProcedure.query(() => ({ status: 'ok' }))
})

export type AppRouter = typeof appRouter;