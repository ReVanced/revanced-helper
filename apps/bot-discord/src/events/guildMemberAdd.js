import { Events } from 'discord.js';

export default {
	name: Events.GuildMemberAdd,
	once: false,
	async execute(_, config, member) {       
       const mute = await client.db.collection('mute').findOne({
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
