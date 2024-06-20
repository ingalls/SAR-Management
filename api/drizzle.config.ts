import type { Config } from "drizzle-kit";

export default {
    dialect: 'postgresql',
    schema: './lib/schema.ts',
    driver: 'pg',
    dbCredentials: {
        connectionString: process.env.POSTGRES || 'postgres://postgres@localhost:5432/sar',
    },
    verbose: true,
    strict: true,
    out: './migrations'
} satisfies Config;
