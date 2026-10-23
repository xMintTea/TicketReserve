import { initTRPC, TRPCError } from "@trpc/server";
import  { db } from "../db/index"
import superjson from 'superjson';
import { auth } from "../lib/auth";


export const createTRPCContext = async (opts: {req: Request}) => {

    const session = await auth.api.getSession({
        headers: opts.req.headers
    })

    return {
        db,
        headers: opts.req.headers,
        user: session?.user ?? null,
        session: session?.session ?? null
    }
}

export type Context = Awaited<ReturnType<typeof createTRPCContext>>;

const t = initTRPC.context<Context>().create({
    transformer: superjson
})

export const router = t.router;
export const publicProcedure = t.procedure;

export const protectedProcedure = publicProcedure.use(({ctx, next}) => {
    if (!ctx.user || !ctx.session) {
        throw new TRPCError({code: "UNAUTHORIZED"})
    }

    return next({
        ctx: {
            ...ctx,
            user: ctx.user,
            session: ctx.session
        }
    })
})


export const adminProcedure = protectedProcedure.use(({ctx, next}) => {
    if (ctx.user.role !== "ADMIN") {
        throw new TRPCError({code: "FORBIDDEN"})
    }

    return next({ ctx })
})