export default async function exileMemberToChannel(member, channel, message, reason, config) {
    const redirectChannel = await channel.client.channels.fetch(config.discord.supportChannel);

    let messageContent = '';
    if (Array.isArray(message)) {
        for (const msg of message) {
            messageContent += `${msg}\n`;
        }
    } else if (!message) {
        message = 'No message provided'
    } else messageContent = message;

    const embedFields = [
        {
            name: 'Orginal message',
            value: messageContent
        }
    ];

    if (reason) {
        embedFields.push(
            {
                name: 'Reason',
                value: reason
            }
        );
    }


    await redirectChannel.send({
        content: `<@${member.id}>`,
        embeds: [
            {
                title: `Restricted to <#${redirectChannel.id}>`,
                fields: embedFields,
                thumbnail: {
                    url: member.avatarURL()
                },
                footer: {
                    text: 'ReVanced',
                    icon_url: channel.client.user.avatarURL()
                }
            }
        ]
    });
}