import { Events } from 'discord.js';

export default {
	name: Events.MessageCreate,
	once: false,
	execute(helper, _, msg) {
		if (!msg.content || msg.author.bot) return;
		if (!msg.mentions.has(msg.client.user)) return;
		helper.scanText(msg.content.toLowerCase().replace(/<.*?>/g, ''), `${msg.channelId}/${msg.id}`);
	}
};
