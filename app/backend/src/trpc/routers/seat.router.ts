import { z } from "zod";
import { adminProcedure, publicProcedure, router } from "../trpc";
import { and, eq } from "drizzle-orm";
import { seats } from "../../db/schema";
import { TRPCError } from "@trpc/server";


const seatFields = z.object({
    hallId: z.number().positive(),
    rowNumber: z.number().min(1),
    seatNumber: z.number().min(1),
    seatType: z.enum(["STANDARD", "VIP", "WHEELCHAIR", "COUPLE"]).default("STANDARD"),
    isActive: z.boolean().default(true)
})


export const seatRouter = router({
    list: publicProcedure
        .input(z.object({
            hallId: z.number().positive(),
            offset: z.number().min(0).default(0),
            limit: z.number().min(1).max(1000).default(100),
            onlyActive: z.boolean().default(false)
        }))
        .query(async ({ ctx, input }) => {
            const conditions = [eq(seats.hallId, input.hallId)]
            if (input.onlyActive) conditions.push(eq(seats.isActive, true));

            return ctx.db
                .select()
                .from(seats)
                .where(and(...conditions))
                .orderBy(seats.rowNumber, seats.seatNumber)
                .offset(input.offset)
                .limit(input.limit)
        }),
    create: adminProcedure
        .input(seatFields)
        .mutation(async ({ ctx, input}) => {
            try {
                const [created] = await ctx.db
                    .insert(seats)
                    .values(input)
                    .returning()
                
                return created
            } catch (e: any) {
                if (e.code === "23505") throw new TRPCError({code: "CONFLICT", message: "This seat already exists"})
                    throw e;
            }
        }),
    update: adminProcedure
        .input(seatFields.omit({hallId: true}).partial().extend({seatId: z.number().positive()}))
        .mutation(async ({ ctx, input}) => {
            try {
                const {seatId, ...data} = input;
                const [updated] = await ctx.db
                    .update(seats)
                    .set(data)
                    .where(eq(seats.id, seatId))
                    .returning()
                

                if (!updated) throw new TRPCError({code: "NOT_FOUND"})

                return updated
            } catch (e: any) {
                if (e.code === "23505") throw new TRPCError({code: "CONFLICT", message: "This seat already exists"});
                throw e;
            }

        })
})