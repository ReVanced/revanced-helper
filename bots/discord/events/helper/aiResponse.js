export default {
	name: 'aiResponse',
	once: false,
	async execute(aiRes) {
		const response = global.config.responses.find(
			(res) => res.label === aiRes.predictions[0].label
		);
		if (!response) return;

		if (Number(aiRes.predictions[0].score) >= response.threshold) {
			const ids = aiRes.id.split('/');
			let channel = global.client.channels.cache.get(ids[0]);

			if (!channel) {
				await global.client.channels.fetch(ids[0]);
				channel = global.client.channels.cache.get(ids[0]);
			}

			let message = channel.messages.cache.get(ids[1]);

			if (!message) {
				await channel.messages.fetch(ids[1]);
				message = channel.messages.cache.get(ids[1]);
			}

			message.reply(response.text);

			return;
		}
	}
};
