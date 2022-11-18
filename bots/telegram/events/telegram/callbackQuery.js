export default {
	name: 'callback_query',
	once: false,
	async execute(bot, helper, cb) {
		const admins = await bot.getChatAdministrators(cb.message.chat.id);
		const isAdmin = admins.find((admin) => admin.user.id === cb.from.id);

		if (!isAdmin)
			return bot.sendMessage(cb.message.chat.id, 'You\'re not an admin.', {
				message_thread_id: cb.message.message_thread_id,
				reply_to_message_id: cb.message.message_id
			});

		helper.sendTrainData(
			cb.message.reply_to_message.text.toLowerCase(),
			cb.data.replace('label_', '').toUpperCase()
		);

		bot.sendMessage(cb.message.chat.id, 'Sent train data to server.', {
			message_thread_id: cb.message.message_thread_id,
			reply_to_message_id: cb.message.message_id
		});

		bot.deleteMessage(cb.message.chat.id, cb.message.message_id);
	}
};
