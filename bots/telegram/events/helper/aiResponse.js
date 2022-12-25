export default {
	name: 'aiResponse',
	once: false,
	async execute(bot, config, aiRes) {
		const ids = aiRes.id.split('/');

		bot.sendMessage(ids[0], aiRes.response, {
			message_thread_id: ids[1],
			reply_to_message_id: ids[2]
		});

		return;
	}
};
