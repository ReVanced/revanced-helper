import {
	EmbedBuilder,
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle
} from 'discord.js';
import trainAISelectMenu from '../../utils/trainAISelectMenu.js';

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

			const embed = new EmbedBuilder()
				.setTitle(response.reply.title)
				.setDescription(response.reply.desc)
				.setColor(14908858)
				.setFooter({ text: `Confidence: ${intent.confidence}` });

			const feedbackRow = new ActionRowBuilder().addComponents(
				new ButtonBuilder()
					.setCustomId('fb-like')
					.setEmoji('👍')
					.setStyle(ButtonStyle.Success),
				new ButtonBuilder()
					.setCustomId('fb-dislike')
					.setEmoji('👎')
					.setStyle(ButtonStyle.Danger)
			);

			const reply = await message.reply({
				embeds: [embed],
				components: [feedbackRow]
			});
			const filter = (i) =>
				i.member.roles.highest.comparePositionTo(
					i.member.guild.roles.cache.get(config.discord.trainRole)
				) > 0;

			const collector = reply.createMessageComponentCollector({
				filter,
				time: 15_000
			});
			collector.on('collect', (i) => {
				if (i.customId == 'fb-like') {
					// We train it using the label the AI gave.
					helper.sendTrainData(message.content);
					i.reply({ ephemeral: true, content: 'Sent train data to server.' });
				} else {
					// We ask the trainer to train it using the select menu.
					trainAISelectMenu(i, config, helper, message);
				}
			});
			return;
		} catch (e) {
			console.log(e);
		}
	}
};
