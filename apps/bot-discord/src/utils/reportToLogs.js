import { EmbedBuilder, messageLink } from 'discord.js';

export default async function reportToLogs(config, client, action, message, { reason, expire, actionTo, actionBy }, interaction) {
    const actionUpper = action.charAt(0).toUpperCase() + action.slice(1);
    const actionTitle = `${actionUpper} ${actionTo.tag}`;
    const actionEmbed = new EmbedBuilder()
        .setThumbnail(actionTo.avatarURL())
        .setTitle(actionTitle);

    const fields = [
        { name: 'Action', value: `${actionTo.toString()} was ${action} by ${actionBy.toString()}` }
    ];

    if (action === 'banned' || action === 'muted') fields.push({
        name: 'Reason',
        value: reason ? reason : 'No reason provided',
        inline: true
    });

    if (expire) fields.push({ name: 'Expires', value: `<t:${expire}:F>`, inline: true });

    if (message) fields.push({ name: 'Reference', value: `[Jump to message](${messageLink(
        message.channelId,
        message.id,
        message.guild.id)})`,
        inline: true
    });

    actionEmbed.setFields(fields);

    if (interaction) {
        await interaction.editReply({ embeds: [actionEmbed] });
        const msg = await interaction.fetchReply();
        reportToLogs(config, client, action, msg, { reason, expire, actionTo, actionBy });
    } else {
        const channel = await client.channels.fetch(config.logs.channelId);
        const thread = await channel.threads.fetch(config.logs.threadId);
        thread.send({ embeds: [actionEmbed] });
    }
}