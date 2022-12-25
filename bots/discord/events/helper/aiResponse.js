export default {
	name: 'aiResponse',
	once: false,
	async execute(client, config, aiRes) {
		if (!aiRes.response) return;

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

			message.reply(aiRes.response);

			return;
		} catch (e) {}

	}
};
