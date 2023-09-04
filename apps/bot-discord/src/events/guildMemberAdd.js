import { Events } from 'discord.js';
import cureUsername from '../utils/cureUsername.js';

export default {
    name: Events.GuildMemberAdd,
    once: false,
    async execute(_, config, member) {
        cureUsername(member);
        const mute = await client.db.collection('muted').findOne({
            guild_id: member.guild.id,
            user_id: member.id
        });

        if (mute) {
            // Add the roles given.
            member.roles.add(mute.support_mute ?
                config.mute.supportGiveRoles :
                config.mute.giveRoles
            );
        }
    }
};
