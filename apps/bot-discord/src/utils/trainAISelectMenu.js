import {
	ActionRowBuilder,
	StringSelectMenuBuilder,
	ComponentType
} from 'discord.js';

export default async function trainAISelectMenu(
	interaction,
	config,
	helper
) {
	const options = [];

	for (const { label } of config.responses) {
		options.push({
			label: label,
			description: `The ${label} label.`,
			value: label.toLowerCase()
		});
	}

	const row = new ActionRowBuilder().addComponents(
		new StringSelectMenuBuilder()
			.setCustomId('select')
			.setPlaceholder('Nothing selected')
			.addOptions(options)
	);

	let interactedMessage;

	if (!interaction.isMessageContextMenuCommand()) {
		try {
			const channel = await interaction.client.channels.fetch(interaction.message.reference.channelId);
			const message = await channel.messages.fetch(interaction.message.reference.messageId);
			interactedMessage = message.content.toLowerCase();
		} catch (e) {
			interaction.reply({
				content: 'The message that you wanted to train the bot with was deleted.',
				ephemeral: true
			})
		}

	} else {
		interactedMessage = interaction.targetMessage.content.toLowerCase()
	}

	const reply = await interaction.reply({
		content: 'Please select the corresponding label to train the bot.',
		components: [row],
		ephemeral: true
	});

	const collector = reply.createMessageComponentCollector({
		componentType: ComponentType.StringSelect,
		time: 15000
	});

	collector.on('collect', (i) => {
		helper.sendTrainData(interactedMessage, i.values[0]);

		i.reply({ content: 'Sent training data to server.', ephemeral: true });

		if (!interaction.isMessageContextMenuCommand()) {
			interaction.message.edit({ components: [] });
		}
	});
}
