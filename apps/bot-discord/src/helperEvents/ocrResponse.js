export default {
	name: 'ocrResponse',
	once: false,
	async execute(client, config, helper, ocrRes) {
		try {
			const ids = ocrRes.id.split('/');
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

			for (const ocrReply of config.ocrResponses) {
				if (ocrRes.ocrText.match(ocrReply.regex)) {
					message.reply({ embeds: [ocrReply.reply] });
					break;
				}
			}
		} catch (e) {
			console.log(e);
		}
	}
};
