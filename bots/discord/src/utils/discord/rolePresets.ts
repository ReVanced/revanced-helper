import { config, database } from '$/context'
import { appliedPresets } from '$/database/schemas'
import type { GuildMember } from 'discord.js'
import { and, eq } from 'drizzle-orm'

// TODO: Fix this type
type PresetKey = string

export const applyRolePreset = async (member: GuildMember, presetName: PresetKey, untilMs: number | null) => {
    const afterInsert = await applyRolesUsingPreset(presetName, member, true)
    const until = untilMs ? Math.ceil(untilMs / 1000) : null

    await database
        .insert(appliedPresets)
        .values({
            memberId: member.id,
            guildId: member.guild.id,
            preset: presetName,
            until,
        })
        .onConflictDoUpdate({
            target: [appliedPresets.memberId, appliedPresets.preset, appliedPresets.guildId],
            set: { until },
        })
        .then(afterInsert)
}

export const removeRolePreset = async (member: GuildMember, presetName: PresetKey) => {
    const afterDelete = await applyRolesUsingPreset(presetName, member, false)

    await database
        .delete(appliedPresets)
        .where(
            and(
                eq(appliedPresets.memberId, member.id),
                eq(appliedPresets.preset, presetName),
                eq(appliedPresets.guildId, member.guild.id),
            ),
        )
        .execute()
        .then(afterDelete)
}

export const applyRolesUsingPreset = async (presetName: string, member: GuildMember, applying: boolean) => {
    const preset = config.rolePresets?.guilds[member.guild.id]?.[presetName]
    if (!preset) throw new Error(`The preset "${presetName}" does not exist for this server`)

    const roles = new Set(member.roles.cache.keys())

    for (const role of preset.give) roles[applying ? 'add' : 'delete'](role)
    for (const role of preset.take) roles[applying ? 'delete' : 'add'](role)

    return () => member.roles.set(Array.from(roles))
}
