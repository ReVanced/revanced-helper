export default {
	name: 'message',
	once: false,
	async execute(msg) {
		if (!msg.text) return;
		global.helper.scanText(
			msg.text.toLowerCase(),
			`${msg.chat.id}/${msg.message_thread_id}/${msg.message_id}`
		);
	}
};
