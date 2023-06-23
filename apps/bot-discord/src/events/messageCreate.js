import { Events } from 'discord.js';

export default {
	name: Events.MessageCreate,
	once: false,
	execute(helper, config, msg) {
		if (!msg.guild || msg.system || msg.webhookId) return;
		if (msg.member.roles.cache.some(role => role.id === config.discord.ignoreRole)) return;
		if (msg.attachments.first() && msg.attachments.first().contentType.startsWith('image')) {
			helper.scanImage(msg.attachments.first().url, `${msg.channelId}/${msg.id}`);
		}
		
		if (!msg.content || msg.author.bot) return;
		helper.scanText(
			msg.content.toLowerCase().replace(/<.*?>/g, ''),
			`${msg.channelId}/${msg.id}`
		);
	}
};
