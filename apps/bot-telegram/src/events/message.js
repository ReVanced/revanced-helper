export default {
	name: 'message',
	once: false,
	async execute(bot, helper, msg) {
		if (msg.photo) {
			const fileLink = await bot.getFileLink(msg.photo.at(-1).file_id);
			helper.scanImage(fileLink, `${msg.chat.id}/${msg.message_thread_id}/${msg.message_id}`)
		}
		if (!msg.text) return;
		helper.scanText(
			msg.text.toLowerCase(),
			`${msg.chat.id}/${msg.message_thread_id}/${msg.message_id}`
		);
	}
};
