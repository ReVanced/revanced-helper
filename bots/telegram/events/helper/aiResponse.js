export default {
	name: 'aiResponse',
	once: false,
	async execute(bot, config, aiRes) {
		if (!aiRes.response) return;
		if (!aiRes.response[0]) return;
		const ids = aiRes.id.split('/');
		const intent = aiRes.response.reduce((a, b) => a.confidence > b.confidence ? a : b);
		const response = config.responses.find((res) => res.label === intent.name);
		if (response.threshold > intent.confidence) return;

		bot.sendMessage(ids[0], `${response.text}\n\n*Confidence: ${intent.confidence}*`, {
			message_thread_id: ids[1],
			reply_to_message_id: ids[2],
			parse_mode: 'HTML'
		});

		return;
	}
};
