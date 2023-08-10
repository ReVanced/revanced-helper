export default async function unmuteMember(config, member) {
    const mute = await member.client.db.collection('mutes').findOne({
        guild_id: member.guild.id,
        user_id: member.id
    });

    if (!mute) return false;
    if (!mute.support_mute) return false;

    member.roles.remove(mute.support_mute ?
        config.mute.supportGiveRoles :
        config.mute.giveRoles
    );

    member.roles.add(mute.taken_roles);

    await member.client.db.collection('mutes').remove({
        guild_id: member.guild.id,
        user_id: member.id
    });

    return true;
}