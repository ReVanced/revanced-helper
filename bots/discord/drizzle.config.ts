import { defineConfig } from 'drizzle-kit'

export default defineConfig({
    dialect: 'sqlite',
    schema: './src/database/schemas.ts',
    dbCredentials: {
        url: process.env['DATABASE_URL'],
    },
})
