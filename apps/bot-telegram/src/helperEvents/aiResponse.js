export default {
	name: 'aiResponse',
	once: false,
	async execute(bot, config, aiRes) {
		if (!aiRes.response) return;
		if (!aiRes.response[0]) return;
		const ids = aiRes.id.split('/');
		const intent = aiRes.response.reduce((a, b) =>
			a.confidence > b.confidence ? a : b
		);
		const response = config.responses.find((res) => res.label === intent.name);
		if (!response) return;
		if (response.threshold > intent.confidence) return;
		if (!response.reply) return;

		bot.sendMessage(
			ids[0],
			`**${response.reply.title}**\n\n${response.reply.description}\n`,
			{
				message_thread_id: ids[1],
				reply_to_message_id: ids[2],
				parse_mode: 'markdown'
			}
		);

		return;
	}
};
