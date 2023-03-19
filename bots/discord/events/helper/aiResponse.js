import { EmbedBuilder } from 'discord.js';

export default {
	name: 'aiResponse',
	once: false,
	async execute(client, config, aiRes) {
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

			const intent = aiRes.response.reduce((a, b) => a.confidence > b.confidence ? a : b);
			const response = config.responses.find((res) => res.label === intent.name);
			if (response.threshold > intent.confidence) return;
			
			const embed = new EmbedBuilder()
								.setTitle('You have asked a Frequently Asked Question')
								.setDescription(response.text)
								.setFooter({ text: `Confidence: ${intent.confidence}` });

			message.reply({ embeds: [embed]});

			return;
		} catch (e) {console.log(e)}

	}
};
