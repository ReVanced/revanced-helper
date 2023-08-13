export default async function exileMemberToChannel(member, channel, message, config, isSlash) {
    const redirectChannel = await channel.client.channels.fetch(config.discord.supportChannel);

    let messageContent = '';
    if (Array.isArray(message)) {
        for (const msg of message) {
            messageContent += `${msg.content}\n`;
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

    const messageParams = {
        content: `<@${member.id}>`,
        embeds: [
            {
                title: '❗ You have been exiled!',
                description: 'This is due to you asking support in non-support channels. Please use the support channel next time.'
            }
        ]
    };
    
    if (isSlash) channel.editReply(messageParams);
    else channel.send(messageParams);

}