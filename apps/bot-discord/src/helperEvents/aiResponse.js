import {
	EmbedBuilder,
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle
} from 'discord.js';

export default {
	name: 'aiResponse',
	once: false,
	async execute(client, config, helper, aiRes) {
		if (!aiRes.response) return;
		if (!aiRes.response[0]) return;

		try {
			const ids = aiRes.id.split('/');

			const intent = aiRes.response.reduce((a, b) =>
				a.confidence > b.confidence ? a : b
			);

			const response = config.responses.find(
				(res) => res.label === intent.name
			);

			if (response.threshold > intent.confidence) return;
			if (!response.reply) return;

			const embed = response.reply;
			embed.footer = { text: `Confidence: ${intent.confidence}` };

			const feedbackRow = new ActionRowBuilder().addComponents(
				new ButtonBuilder()
					.setCustomId('fb-like')
					.setEmoji('👍')
					.setStyle(ButtonStyle.Primary),
				new ButtonBuilder()
					.setCustomId('fb-dislike')
					.setEmoji('👎')
					.setStyle(ButtonStyle.Primary)
			);

			let channel = client.channels.cache.get(ids[0]);

			if (!channel) {
				await client.channels.fetch(ids[0]);
				channel = client.channels.cache.get(ids[0]);
			}

			if (!ids[1]) {
				// This means that it's a thread/forum.
				if (response.closeThread) {
					channel.setArchived(true);
				}

				if (response.lockThread) {
					channel.setLocked(true);
				}
				
				channel.send({
					embeds: [embed],
					components: [feedbackRow]
				});
			} else {
				let message = channel.messages.cache.get(ids[1]);

				if (!message) {
					await channel.messages.fetch(ids[1]);
					message = channel.messages.cache.get(ids[1]);
				}

				message.reply({
					embeds: [embed],
					components: [feedbackRow]
				});
			}
		} catch (e) {
			console.log(e);
		}
	}
};
