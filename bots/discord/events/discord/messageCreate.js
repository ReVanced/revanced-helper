import { Events } from 'discord.js';

export default {
	name: Events.MessageCreate,
	once: false,
	execute(msg) {
		if (!msg.content || msg.author.bot) return;
		msg.client.helper.scanText(
			msg.content.toLowerCase(),
			`${msg.channelId}/${msg.id}`
		);
	}
};
