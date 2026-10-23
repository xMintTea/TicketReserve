import { input, z } from "zod"
import { adminProcedure, publicProcedure, router } from "../trpc"
import { users } from "../../db/schema"
import { eq } from "drizzle-orm"
import { auth } from "../../lib/auth"

export const userRouter = router({
    getById: adminProcedure
        .input(z.object({ id: z.string()}))
        .query(async ({ctx, input}) => {
            const [user] = await ctx.db.select().from(users).where(eq(users.id, input.id))
            if (!user) {
                throw new Error("User not found")
            }
            const {...safeUser} = user;
            return safeUser;
    }),
    list: adminProcedure
        .query(async ({ctx}) => {
            const usersList = await ctx.db.select().from(users)
            return usersList
    }),
    setRole: adminProcedure
        .input(z.object({
            userId: z.string(),
            role: z.enum(["CUSTOMER", "ADMIN"])}))
        .mutation(async ({ ctx, input}) => {
            await ctx.db.update(users)
                .set({role: input.role})
                .where(eq(users.id, input.userId));
            return { ok: true }
    }),
    ban: adminProcedure
        .input(z.object({
            userId: z.string(),
            banReason: z.string().optional(),
            banExpiresAt: z.number().optional() //seconds
        }))
        .mutation(async ({ctx, input}) => {
            return auth.api.banUser({
                headers: ctx.headers,
                body: input
            })
    }),
    unban: adminProcedure
        .input(z.object({
            userId: z.string()
        }))
        .mutation(async ({ ctx, input}) => {
            return auth.api.unbanUser({
                headers: ctx.headers,
                body: input
            })
        })
})
