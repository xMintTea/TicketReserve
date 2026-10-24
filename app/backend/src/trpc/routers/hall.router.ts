import { z } from "zod";
import { adminProcedure, publicProcedure, router } from "../trpc";
import { halls } from "../../db/schema";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";



const hallFiels = z.object({
    name: z.string().min(1).max(256),
    type: z.enum(["STANDARD", "IMAX"]).default("STANDARD")
})

export const hallRouter = router({
    list: publicProcedure
        .input(z.object({
            offset: z.number().default(0),
            limit: z.number().min(0).max(1000).default(100)
        }))
        .query(async ({ ctx, input}) => {
            return ctx.db
                .select()
                .from(halls)
                .offset(input.offset)
                .limit(input.limit)
        }),
    create: adminProcedure
        .input(hallFiels)
        .mutation(async ({ ctx, input }) => {

            try {
                const [created] = await ctx.db
                    .insert(halls)
                    .values(input)
                    .returning();
                
                    return created;
            } catch(e: any) {
                if (e.code === "23505") throw new TRPCError({code: "CONFLICT", message: "Hall with this name already exists"});
                throw e;
            }
        }),
    update: adminProcedure
        .input(hallFiels.partial().extend({ hallId: z.number()}))
        .mutation(async ({ctx, input}) => {
            try {
                const  {hallId, ...data} = input
                const [updated] = await ctx.db
                    .update(halls)
                    .set(data)
                    .where(eq(halls.id, hallId))
                    .returning()
                
                if (!updated) throw new TRPCError({code: "NOT_FOUND"});
                return updated
            } catch (e: any) {
                if (e.code === "23505") throw new TRPCError({code: "CONFLICT", message: "Hall with this name already exists"});
                throw e;
            }

        })
})