import { EmbedBuilder, messageLink } from 'discord.js';

export default async function reportToLogs(config, client, action, message, { reason, expire, actionTo, actionBy }, channel) {
    const channel = await client.channels.fetch(config.logs.channelId);
    const thread = await channel.threads.fetch(config.logs.threadId);

    const actionEmbed = new EmbedBuilder()
        .setThumbnail(actionTo.user.avatarURL());

    const fields = [
        { name: 'Action', value: `${actionTo.toString()} was ${action} by ${actionBy.toString()}` }
    ];

    if (action === 'banned' || action === 'muted') fields.push({
        name: 'Reason',
        value: reason ? reason : 'No reason provided'
    });

    if (expire) fields.push({ name: 'Expires', value: `<t:${expire}:F>`});

    if (!message) fields.push({ name: 'Reference', value: `[Jump to message](${messageLink(
        message.channelId,
        message.id,
        message.guild.id)})`
    });

    actionEmbed.setFields(fields);

    if (channel) {
        const msg = await channel.send({ embeds: [actionEmbed] });
        reportToLogs(config, client, action, msg, { reason, expire, actionTo, actionBy });
    } else thread.send({ embeds: [actionEmbed] });
}