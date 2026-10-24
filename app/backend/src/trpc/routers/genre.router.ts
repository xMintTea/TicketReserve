import { z } from "zod";
import { adminProcedure, publicProcedure, router } from "../trpc";
import { genres } from "../../db/schema";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";


const genreFields = z.object({
    name: z.string().min(1).max(256),
    slug: z.string().min(1).max(256).regex(/^[a-z0-9-]+$/, "lowercase, digits, hyphens only")
})


export const genreRouter = router({
    list: publicProcedure
        .input(z.object({
            offset: z.number().min(0).default(0),
            limit: z.number().min(0).max(1000).default(100)
        }))
        .query(async ({ ctx, input}) => {
            return ctx.db
                .select()
                .from(genres)
                .offset(input.offset)
                .limit(input.limit)
        }),
    create: adminProcedure
        .input(genreFields)
        .mutation(async ({ ctx, input}) => {
            try {
                const [created] = await ctx.db
                    .insert(genres)
                    .values(input)
                    .returning()
                return created
            } catch (e: any) {
                if (e.code === "23505") throw new TRPCError({code: "CONFLICT", message: "Slug already exists"});
                throw e;
            }

        }),
    update: adminProcedure
        .input(genreFields.partial().extend({ genreId: z.number()}))
        .mutation(async ({ ctx, input }) => {
            const {genreId, ...data} = input
            const [updated] = await ctx.db
                .update(genres)
                .set(data)
                .where(eq(genres.id, genreId))
                .returning();
            
            if (!updated) throw new TRPCError({code: "NOT_FOUND"});
            return updated;
        })
})