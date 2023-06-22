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
			let channel = client.channels.cache.get(ids[0]);

			if (!channel) {
				await client.channels.fetch(ids[0]);
				channel = client.channels.cache.get(ids[0]);
			}

			let message = channel.messages.cache.get(ids[1]);

			if (!message) {
				await channel.messages.fetch(ids[1]);
				message = channel.messages.cache.get(ids[1]);
			}

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

			message.reply({
				embeds: [embed],
				components: [feedbackRow]
			});
			return;
		} catch (e) {
			console.log(e);
		}
	}
};
