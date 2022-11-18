import { Events } from 'discord.js';

export default {
	name: Events.MessageCreate,
	once: false,
	execute(helper, _, msg) {
		if (!msg.content || msg.author.bot) return;
		helper.scanText(msg.content.toLowerCase(), `${msg.channelId}/${msg.id}`);
	}
};
