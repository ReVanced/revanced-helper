import type { InferSelectModel } from 'drizzle-orm'
import { sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const responses = sqliteTable('responses', {
    replyId: text('reply').primaryKey().notNull(),
    channelId: text('channel').notNull(),
    guildId: text('guild').notNull(),
    referenceId: text('ref').notNull(),
    label: text('label').notNull(),
    content: text('text').notNull(),
    correctedById: text('by'),
})

export const appliedPresets = sqliteTable('applied_presets', {
    memberId: text('member').primaryKey().notNull(),
    guildId: text('guild').notNull(),
    presets: text('presets', { mode: 'json' }).$type<string[]>().notNull().default([]),
})

export type Response = InferSelectModel<typeof responses>
export type AppliedPreset = InferSelectModel<typeof appliedPresets>
