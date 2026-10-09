import { initTRPC } from "@trpc/server";
import  { db } from '../index';
import superjson from 'superjson';

export const createTRPCContext = () => {
    return {
        db
    }
}

export type Context = Awaited<ReturnType<typeof createTRPCContext>>;

const t = initTRPC.context<Context>().create({
    transformer: superjson
})

export const router = t.router;
export const publicProcedure = t.procedure;
