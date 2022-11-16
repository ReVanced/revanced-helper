export default {
    name: 'message',
    once: false,
    async execute(msg) {
        global.helper.scanText(msg.text.toLowerCase(), `${msg.chat.id}/${msg.message_thread_id}/${msg.message_id}`);
    }
}