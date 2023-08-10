import parse from 'parse-duration'
import setMuteTimeout from './setMuteTimeout.js';

parse['mo'] = parse['month']

export default async function muteMember(config, member, { duration, reason, supportMute }) {
    let expires;
    
    if (supportMute) {
        expires = Date.now() + duration;
    } else {
        const parsedDuration = parse(duration);
        expires = Date.now() + parsedDuration;
    }

    const takenRoles = [];
    for (const takeRole of supportMute ? 
        config.discord.mute.supportTakeRoles :
        config.discord.mute.takeRoles
        ) {
        if (member.roles.cache.get(takeRole)) {
            takenRoles.push(takeRoles);
        }
    }

    const existingMute = await member.client.db.collection('muted').findOne({
        guild_id: member.guild.id,
        user_id: member.id
    });

    if (existingMute) {
        // Update existing mute

        await member.client.db.collection('muted').updateOne({
            guild_id: member.guild.id,
            user_id: member.id
        }, {
            $set: {
                reason,
                expires,
                support_mute: supportMute
            }
        });

        if (client.mutes.has(member.id)) {
            clearTimeout(client.mutes.get(member.id))
            client.mutes.delete(member.id);
        }
    } else {
        await member.client.db.collection('muted').insert({
            guild_id: member.guild.id,
            user_id: member.id,
            taken_roles: takenRoles,
            expires,
            reason,
            support_mute: supportMute
        });
    }

    // Remove the roles, give defined roles.
    if (!existingMute) {
        member.roles.remove(takenRoles);
        member.roles.add(supportMute ?
            config.discord.mute.giveRoles :
            config.discord.mute.supportGiveRoles
        );
    }
    

    // Start a timeout.
    setMuteTimeout({
        guild_id: member.guild.id,
        user_id: member.id,
        taken_roles: takenRoles,
        expires,
        support_mute: supportMute
    }, member.client.mutes, member.client);

    // Return parsed time for the mute command to resolve.
    return expires;
}