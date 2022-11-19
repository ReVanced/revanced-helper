export default {
	name: 'aiResponse',
	once: false,
	async execute(client, config, aiRes) {
		const response = config.responses.find(
			(res) => res.label === aiRes.predictions[0].label
		);
		if (!response) return;

		if (Number(aiRes.predictions[0].score) >= response.threshold) {
			const ids = aiRes.id.split('/');

			if (!response.responses[0]) return;

			const replyMsg = response.responses.find(res => res.p === 'reddit').text;

			switch (ids[0]) {
			case 'comment': {
				client.getComment(ids[1]).reply(replyMsg);
				break;
			}

			case 'post': {
				client.getSubmission(ids[1]).reply(replyMsg);
				break;
			}
			}

			return;
		}
	}
};
