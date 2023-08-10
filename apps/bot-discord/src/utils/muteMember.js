import parse from 'parse-duration'
import setMuteTimeout from './setMuteTimeout.js';

parse['mo'] = parse['month']

export default async function muteMember(config, member, { duration, reason, supportMute }) {
    let expires;
    
    if (supportMute) {
        expires = Math.floor((Date.now() + duration) / 1000);
    } else {
        const parsedDuration = parse(duration);
        expires = Math.floor((Date.now() + parsedDuration) / 1000);
    }

    const takenRoles = [];
    for (const takeRole of supportMute ? 
        config.discord.mute.supportTakeRoles :
        config.discord.mute.takeRoles
        ) {
        if (member.roles.cache.get(takeRole)) {
            takenRoles.push(takeRole);
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

        if (member.client.mutes.has(member.id)) {
            clearTimeout(member.client.mutes.get(member.id))
            member.client.mutes.delete(member.id);
        }
    } else {
        await member.client.db.collection('muted').insertOne({
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
        const currentRoles = member.roles.cache.map((role) => role.id);
        let setRoles = [];
        for (const role of currentRoles) {
            if (takenRoles.includes(role)) continue;
            setRoles.push(role);
        }

        setRoles = setRoles.concat(supportMute ?
            config.discord.mute.supportGiveRoles :
            config.discord.mute.giveRoles)
        await member.roles.set(setRoles);
    }
    

    // Start a timeout.
    setMuteTimeout({
        guild_id: member.guild.id,
        user_id: member.id,
        taken_roles: takenRoles,
        expires,
        support_mute: supportMute
    }, member.client.mutes, member.client, config);

    // Return parsed time for the mute command to resolve.
    return expires;
}