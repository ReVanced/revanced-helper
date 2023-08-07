export default async function setMuteTimeout(mute, mutes) {
    const duration = Date.now() - mute.expires;
    mutes.set(mute.user_id, setTimeout(async() => {
        const guild = await client.guilds.fetch(mute.guild_id);
        let member;
        try {
            member = await guild.members.fetch(mute.user_id);
        } catch (_) {
            return;
        }

        member.roles.add(mute.taken_roles);
        member.roles.remove(
        mute.support_mute ?
            config.discord.mute.supportGiveRoles : 
            config.discord.mute.giveRoles
        );
    }, duration));
}