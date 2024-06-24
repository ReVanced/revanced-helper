import { on } from '$/utils/discord/events'
import { cureNickname } from '$/utils/discord/moderation'

on('guildMemberUpdate', async (_, oldMember, newMember) => {
    if (newMember.user.bot) return
    if (oldMember.nickname !== newMember.nickname) await cureNickname(newMember)
})

on('guildMemberAdd', (_, member) => {
    if (member.user.bot) return
    cureNickname(member)
})

on('messageCreate', async (_, msg) => {
    if (msg.author.bot) return
    if (!msg.member) return
    await cureNickname(msg.member)
})
