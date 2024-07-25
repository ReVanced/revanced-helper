import { GuildMember, type User } from 'discord.js'
import type { Config } from 'config.schema'

export const isAdmin = (userOrMember: User | GuildMember, adminConfig: Config['admin']) => {
    return adminConfig?.users?.includes(userOrMember.id) || (userOrMember instanceof GuildMember && isMemberAdmin(userOrMember, adminConfig))
}

export const isMemberAdmin = (member: GuildMember, adminConfig: Config['admin']) => {
    const roles = new Set(member.roles.cache.keys())
    return Boolean(adminConfig?.roles?.[member.guild.id]?.some(role => roles.has(role)))
}