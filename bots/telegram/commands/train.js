export default {
	command: /\/train/,
	async execute(msg) {
		if (msg.reply_to_message.message_id === msg.message_thread_id)
			return global.bot.sendMessage(msg.chat.id, 'Please reply to a message!', {
				message_thread_id: msg.message_thread_id,
				reply_to_message_id: msg.message_id
			});

		const options = [];
		let arrI = 0;
		let i = 0;
		for (const { label } of global.config.responses) {
			if (arrI === 0 && i === 0) {
				options.push([{
					text: label,
					callback_data: `label_${label.toLowerCase()}`
				}]);
				i++;
			} else if (i === 2) {
				options.push([{
					text: label,
					callback_data: `label_${label.toLowerCase()}`
				}]);
				i = 0;
				arrI++
			} else {
				options[arrI].push({
					text: label,
					callback_data: `label_${label.toLowerCase()}`
				});
				i++;
			}
		}

		console.log(options);
		const admins = await global.bot.getChatAdministrators(msg.chat.id);
		const isAdmin = admins.find((admin) => admin.user.id === msg.from.id);

		if (!isAdmin)
			return global.bot.sendMessage(msg.chat.id, 'You\'re not an admin.', {
				message_thread_id: msg.message_thread_id,
				reply_to_message_id: msg.message_id
			});
		global.bot.sendMessage(
			msg.chat.id,
			'Please select the corresponding label to train the bot.',
			{
				message_thread_id: msg.message_thread_id,
				reply_to_message_id: msg.reply_to_message.message_id,
				reply_markup: {
					inline_keyboard: options
				}
			}
		);
	}
};
