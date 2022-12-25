export default {
	name: 'aiResponse',
	once: false,
	async execute(client, config, aiRes) {
		const ids = aiRes.id.split('/');

		switch (ids[0]) {
			case 'comment': {
				client.getComment(ids[1]).reply(aiRes.response);
				break;
			}

			case 'post': {
				client.getSubmission(ids[1]).reply(aiRes.response);
				break;
			}
		}

		return;

	}
};
