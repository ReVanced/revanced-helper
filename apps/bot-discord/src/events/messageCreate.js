import { Events } from 'discord.js';

export default {
	name: Events.MessageCreate,
	once: false,
	async execute(helper, config, msg) {
		if (!msg.guild || msg.system || msg.webhookId || msg.author.bot) return;
		if (msg.content.startsWith('?')) {
			const [cmd, args] = msg.content.replace('?', '').split(/\s/g);
			const command = msg.client.msgCommands.get(cmd);
			if (command) {
				await command.execute(msg, args, config);
			}
		}
		const hasImmunity = msg.member.roles.cache.some(role => role.id === config.discord.ignoreRole);
		if (config.discord.ignoreChannels.includes(msg.channelId)) return;
		if (msg.attachments.first() && msg.attachments.first().contentType.startsWith('image') && !hasImmunity) {
			helper.scanImage(msg.attachments.first().url, `${msg.channelId}/${msg.id}`);
		}

		if (msg.content && !hasImmunity) {
		    helper.scanText(
			    msg.content.toLowerCase().replace(/<.*?>/g, ''),
		  	    `${msg.channelId}/${msg.id}`
		    );
		}

		// Sticky message
		if (msg.channel.id !== config.sticky.channelId) return;
		if (msg.client.stickiedMessageTimeout) clearInterval(msg.client.stickiedMessageTimeout);

		msg.client.stickiedMessageTimeout = setTimeout(async () => {
			const channel = await msg.client.channels.fetch(config.sticky.channelId);

			const message = await channel.send({ embeds: [config.sticky.stickyMessage] });

			if (msg.client.stickiedMessage) channel.messages.delete(msg.client.stickiedMessage);

			msg.client.stickiedMessage = message.id;
		}, config.sticky.timeout);
	}
};
