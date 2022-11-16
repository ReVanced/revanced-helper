import { Events } from 'discord.js';

export default {
	name: Events.MessageCreate,
	once: false,
	execute(msg) {
		msg.client.helper.scanText(msg.content, `${msg.channelId}/${msg.id}`);
	}
};
