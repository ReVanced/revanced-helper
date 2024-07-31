import { on } from '$/utils/discord/events'
import { cureNickname } from '$/utils/discord/moderation'

on('guildMemberUpdate', async (oldMember, newMember) => {
    if (newMember.user.bot) return
    if (oldMember.displayName !== newMember.displayName) await cureNickname(newMember)
})

on('guildMemberAdd', member => {
    if (member.user.bot) return
    cureNickname(member)
})

on('messageCreate', async msg => {
    if (msg.author.bot || !msg.member) return
    await cureNickname(msg.member)
})
