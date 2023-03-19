export default {
	name: 'aiResponse',
	once: false,
	async execute(client, config, aiRes) {
		if (!aiRes.response) return;
		if (!aiRes.response[0]) return;
		const ids = aiRes.id.split('/');

		const intent = aiRes.response.reduce((a, b) => a.confidence > b.confidence ? a : b);
		const response = config.responses.find((res) => res.label === intent.name);
		if (response.threshold > intent.confidence) return;

		switch (ids[0]) {
			case 'comment': {
				client.getComment(ids[1]).reply(`${response.text}\n\n*Confidence: ${intent.confidence}*`);
				break;
			}

			case 'post': {
				client.getSubmission(ids[1]).reply(`${response.text}\n\n*Confidence: ${intent.confidence}*`);
				break;
			}
		}

		return;

	}
};
