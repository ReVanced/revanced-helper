import { defineConfig } from 'drizzle-kit'

export default defineConfig({
    dialect: 'sqlite',
    schema: './src/database/schemas.ts',
    dbCredentials: {
        url: `file:./${process.env['DATABASE_PATH']}`,
    },
})
