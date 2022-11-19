export default {
	name: 'aiResponse',
	once: false,
	async execute(bot, config, aiRes) {
		const response = config.responses.find(
			(res) => res.label === aiRes.predictions[0].label
		);
		if (!response) return;

		if (Number(aiRes.predictions[0].score) >= response.threshold) {
			const ids = aiRes.id.split('/');

			if (!response.responses[0]) return;

			const replyMsg = response.responses.find(res => res.p === 'telegram').text;

			bot.sendMessage(ids[0], replyMsg, {
				message_thread_id: ids[1],
				reply_to_message_id: ids[2]
			});

			return;
		}
	}
};
