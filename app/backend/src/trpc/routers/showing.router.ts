import { endsWith, z }  from "zod";
import { adminProcedure, publicProcedure, router } from "../trpc";
import { and, eq, gte, lte } from "drizzle-orm";
import { showings } from "../../db/schema";
import { TRPCError } from "@trpc/server";


const showingFields = z.object({
    movieId: z.number().positive(),
    hallId: z.number().positive(),
    startTime: z.coerce.date(),
    endTime: z.coerce.date(),
    format: z.enum(["2D", "3D"]).default("2D"),
    basePrice: z.number().min(0).max(9_999_999.99)
        .transform((n) => n.toFixed(2)),
    status: z.enum(["SCHEDULED", "FINISHED", "CANCELLED"]).default("SCHEDULED")
}).refine((v) => v.endTime > v.startTime, {
    error: "endTime must be after startTime",
    path: ["endTime"]
})

const hasValidTime = (data: {
    startTime?: Date,
    endTime?: Date
}) =>
    data.startTime === undefined ||
    data.endTime === undefined ||
    data.endTime > data.startTime


const showingFieldsCreate = showingFields.refine(
    ({ startTime, endTime}) => endTime > startTime,
    { error: "endTime must be after startTime", path: ["endTime"]}
)


const showingFieldsUpdate = showingFields
    .partial()
    .omit({movieId: true, hallId: true})
    .extend({showingId: z.number().positive()})
    .refine(hasValidTime, {
        error: "endTime must be after startTime",
        path: ["endTime"]
    })

export const showingRouter = router({
    list: publicProcedure
        .input(z.object({
            movieId: z.number().positive().optional(),
            hallId: z.number().positive().optional(),
            from: z.coerce.date().optional(),
            to: z.coerce.date().optional(),
            status: z.enum(["SCHEDULED", "FINISHED", "CANCELLED"]).optional(),
            offset: z.number().nonnegative().default(0),
            limit: z.number().min(1).max(1000).default(100)
        }))
        .query(async ({ ctx, input }) => {
            const conditions = [];

            if (input.movieId) {
                conditions.push(eq(showings.movieId, input.movieId))
            }

            if (input.hallId) {
                conditions.push(eq(showings.hallId, input.hallId))
            }

            if (input.status) {
                conditions.push(eq(showings.status, input.status))
            }

            if (input.from) {
                conditions.push(gte(showings.startTime, input.from))
            }

            if (input.to) {
                conditions.push(lte(showings.endTime, input.to))
            }

            return ctx.db
                .select()
                .from(showings)
                .where(and(...conditions))
                .orderBy(showings.startTime, showings.id)
                .offset(input.offset)
                .limit(input.limit)
        }),
    create: adminProcedure
        .input(showingFieldsCreate)
        .mutation(async ({ ctx, input }) => {

            try {
                const [created] = await ctx.db
                    .insert(showings)
                    .values(input)
                    .returning();
                
                return created
            } catch (e: any) {
                if (e.code === "23P01") throw new TRPCError({code: "BAD_REQUEST", message: "Showings cannot overlap"});
                throw e;
            }


            
        }),
    update: adminProcedure
        .input(showingFieldsUpdate)
        .mutation(async ({ ctx, input }) => {
            const {showingId, ...data} = input

            if (Object.keys(data).length === 0) throw new TRPCError({code: "BAD_REQUEST", message: "Nothing to update"});


            try {
                const [updated] = await ctx.db
                    .update(showings)
                    .set(data)
                    .where(eq(showings.id, showingId))
                    .returning();
                
                if (!updated) throw new TRPCError({code: "NOT_FOUND"});

                return updated
            } catch (e: any) {
                if (e.code === "23P01") throw new TRPCError({code: "BAD_REQUEST", message: "Cannot update. Encounter overlap between showings"});
                throw e;
            } 
        })

})