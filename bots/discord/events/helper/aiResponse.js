export default {
	name: 'aiResponse',
	once: false,
	async execute(client, config, aiRes) {
		const response = config.responses.find(
			(res) => res.label === aiRes.predictions[0].label
		);
		if (!response) return;

		if (Number(aiRes.predictions[0].score) >= response.threshold) {
			if (!response.responses[0]) return;

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
			
			const replyMsg = response.responses.find(res => res.p === 'discord').text;
			
			message.reply(replyMsg);

			return;
		}
	}
};
