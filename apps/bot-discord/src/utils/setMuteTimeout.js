export default async function setMuteTimeout(mute, client, config) {
    const duration = (mute.expires - Math.floor(new Date() / 1000)) * 1000;
    client.mutes.set(mute.user_id, setTimeout(async() => {
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

        client.db.collection('muted').deleteOne({
            user_id: mute.user_id,
            guild_id: mute.guild_id
        });
    }, duration));
}