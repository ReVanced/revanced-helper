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

			if (!response.text) return;

			global.bot.sendMessage(ids[0], response.text, {
				message_thread_id: ids[1],
				reply_to_message_id: ids[2]
			});

			return;
		}
	}
};
