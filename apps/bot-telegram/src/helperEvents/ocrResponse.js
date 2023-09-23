export default {
    name: 'ocrResponse',
    once: false,
    async execute(bot, config, ocrRes) {
        const ids = ocrRes.id.split('/');

        for (const ocrReply of config.ocrResponses) {
            if (ocrRes.ocrText.match(ocrReply.regex)) {

                bot.sendMessage(
                    ids[0],
                    `## ${ocrReply.reply.title}\n\n${ocrReply.reply.description}`,
                    {
                        message_thread_id: ids[1],
                        reply_to_message_id: ids[2],
                        parse_mode: 'markdown'
                    }
                );
                break;
            }
        }
        return;
    }
};
