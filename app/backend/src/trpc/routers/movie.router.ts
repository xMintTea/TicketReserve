import z from "zod";
import { adminProcedure, publicProcedure, router } from "../trpc";
import { movies } from "../../db/schema";
import { eq } from "drizzle-orm";

export const movieRouter = router({
    list: publicProcedure
        .input(z.object({
            offset: z.number().optional().default(0),
            limit: z.number().min(0).max(1000).optional().default(100)
        }))
        .query(async ({ ctx, input}) => {
            return ctx.db
                .select()
                .from(movies)
                .offset(input.offset)
                .limit(input.limit)
        }),
    create: adminProcedure
        .input(z.object({
            title: z.string(),
            description: z.string().optional(),
            durationMinutes: z.number().optional(),
            releaseDate: z.string().optional(),
            ageRating: z.enum(["0+","4+","8+","10+", "12+", "14+", "16+", "18+"]),
            posterUrl: z.string().optional(),
            trailerUrl: z.string().optional(),
            status: z.enum(["COMING_SOON", "NOW_SHOWING", "ARCHIVED"]).optional()
        }))
        .mutation(async ({ ctx, input}) => {
            return ctx.db
                .insert(movies)
                .values(input).returning()
        }),
    update: adminProcedure
        .input(z.object({
            movieId: z.number(),
            title: z.string(),
            description: z.string().optional(),
            durationMinutes: z.number().optional(),
            releaseDate: z.string().optional(),
            ageRating: z.enum(["0+","4+","8+","10+", "12+", "14+", "16+", "18+"]),
            posterUrl: z.string().optional(),
            trailerUrl: z.string().optional(),
            status: z.enum(["COMING_SOON", "NOW_SHOWING", "ARCHIVED"]).optional()
        }))
        .mutation(async ({ ctx, input}) => {
            const {movieId, ...data} = input
            return ctx.db
                .update(movies)
                .set(data)
                .where(eq(movies.id, movieId))
                .returning()
        })
}) 