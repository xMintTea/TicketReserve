import { z } from "zod"
import { publicProcedure, router } from "../trpc"
import { users } from "../../db/schema"
import { eq } from "drizzle-orm"
import { TRPCError } from "@trpc/server"
import bcrypt from 'bcryptjs'

export const userRouter = router({
    register: publicProcedure
    .input(z.object({
        email: z.email().min(4).max(256).trim().toLowerCase(),
        password: z.string().min(8).max(16)
    })
    )
    .mutation(async ({ctx, input}) => {
        const [existing] = await ctx.db.
        select({id: users.id})
        .from(users)
        .where(eq(users.email, input.email))
    
        if (existing) {
            throw new TRPCError({ code: "CONFLICT", message: "User with this email already exists"})
        }

        const passwordHash = await bcrypt.hash(input.password, 10)

        const [user] = await ctx.db
            .insert(users)
            .values({
                email: input.email,
                passwordHash
            })
            .returning({ id: users.id, email: users.email, role: users.role})

        return user
    }),
    login: publicProcedure
        .input(z.object({
            email: z.email().trim().toLowerCase(),
            password: z.string()
        }))
        .mutation(async ({ ctx, input}) => {
            const [user] = await ctx.db
            .select()
            .from(users)
            .where(eq(users.email, input.email))

            if (!user) {
                throw new TRPCError({ code: 'UNAUTHORIZED', message: "Wrong email or password"})
            }

            const ok = await bcrypt.compare(input.password, user.passwordHash)

            if (!ok) {
                throw new TRPCError({code: "UNAUTHORIZED", message: "Wrong email or password"})
            }

            return {id: user.id, email: user.email, role: user.role}
        }),
        getById: publicProcedure
            .input(z.object({ id: z.number()}))
            .query(async ({ctx, input}) => {
                const [user] = await ctx.db.select().from(users).where(eq(users.id, input.id))
                if (!user) {
                    throw new Error("User not found")
                }
                const {passwordHash, ...safeUser} = user;
                return safeUser;
        }),
})
