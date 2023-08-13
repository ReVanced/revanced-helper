export default async function unmuteMember(config, member, supportMute) {
    const mute = await member.client.db.collection('muted').findOne({
        guild_id: member.guild.id,
        user_id: member.id
    });

    if (!mute) return false;
    if (supportMute) {
        if (!mute.support_mute) return false;
    }

    member.roles.remove(mute.support_mute ?
        config.discord.mute.supportGiveRoles :
        config.discord.mute.giveRoles
    );

    member.roles.add(mute.taken_roles);

    await member.client.db.collection('muted').deleteOne({
        user_id: member.id
    });

    return true;
}