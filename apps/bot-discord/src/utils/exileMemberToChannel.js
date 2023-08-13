export default async function exileMemberToChannel(member, channel, message, config, ) {
    const redirectChannel = await channel.client.channels.fetch(config.discord.supportChannel);

    let messageContent = '';
    if (Array.isArray(message)) {
        for (const msg of message) {
            messageContent += `${msg}\n`;
        } 
    } else if (!message) message = 'No message provided';
    else messageContent = message;

    await redirectChannel.send({
        content: `<@${member.id}>`,
        embeds: [
            {
                title: '❗ An exiled member appears!',
                fields: [
                    {
                        name: 'Their message',
                        value: messageContent
                    }
                ]
            }
        ]
    });
}