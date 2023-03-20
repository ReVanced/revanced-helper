export default {
	name: 'aiResponse',
	once: false,
	async execute(client, config, aiRes) {
		if (!aiRes.response) return;
		if (!aiRes.response[0]) return;
		const ids = aiRes.id.split('/');

		const intent = aiRes.response.reduce((a, b) =>
			a.confidence > b.confidence ? a : b
		);
		const response = config.responses.find((res) => res.label === intent.name);
		if (response.threshold > intent.confidence) return;
		if (!response.reply) return;

		switch (ids[0]) {
		case 'comment': {
			client
				.getComment(ids[1])
				.reply(
					`## ${response.reply.title}\n\n${response.reply.desc}\n\n*Confidence: ${intent.confidence}*\n\nThis bot is currently being tested in production. Ignore it, if it's wrong.`
				);
			break;
		}

		case 'post': {
			client
				.getSubmission(ids[1])
				.reply(
					`## ${response.reply.title}\n\n${response.reply.desc}\n\n*Confidence: ${intent.confidence}*\n\nThis bot is currently being tested in production. Ignore it, if it's wrong.`
				);
			break;
		}
		}

		return;
	}
};
