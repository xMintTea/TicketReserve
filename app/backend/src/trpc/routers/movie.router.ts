import z from "zod";
import { adminProcedure, publicProcedure, router } from "../trpc";
import { movies } from "../../db/schema";
import { eq } from "drizzle-orm";


const movieFields = z.object({
    title: z.string(),
    description: z.string().optional(),
    durationMinutes: z.number().optional(),
    releaseDate: z.string().optional(),
    ageRating: z.enum(["0+","4+","8+","10+", "12+", "14+", "16+", "18+"]),
    posterUrl: z.string().optional(),
    trailerUrl: z.string().optional(),
    status: z.enum(["COMING_SOON", "NOW_SHOWING", "ARCHIVED"]).optional()
})


export const movieRouter = router({
    list: publicProcedure
        .input(z.object({
            offset: z.number().default(0),
            limit: z.number().min(0).max(1000).default(100)
        }))
        .query(async ({ ctx, input}) => {
            return ctx.db
                .select()
                .from(movies)
                .offset(input.offset)
                .limit(input.limit)
        }),
    create: adminProcedure
        .input(movieFields)
        .mutation(async ({ ctx, input}) => {
            return ctx.db
                .insert(movies)
                .values(input).returning()
        }),
    update: adminProcedure
        .input(movieFields.partial().extend({ movieId: z.number()}))
        .mutation(async ({ ctx, input}) => {
            const {movieId, ...data} = input
            return ctx.db
                .update(movies)
                .set(data)
                .where(eq(movies.id, movieId))
                .returning()
        })
}) 