import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../db";
import * as schema from "../db/schema"
import { admin, openAPI } from "better-auth/plugins"

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "pg",
        schema: schema,
        usePlural: true,
        debugLogs: true
    }),
    emailAndPassword: {
        enabled: true
    },
    trustedOrigins: [
        "http://localhost:3000",
        "http://localhost:3001"
    ],
    plugins: [
        openAPI(),
        admin()
    ]
})