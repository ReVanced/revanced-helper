import {
	ActionRowBuilder,
	StringSelectMenuBuilder,
	ComponentType
} from 'discord.js';

export default async function trainAISelectMenu(
	interaction,
	config,
	helper,
	message
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
	const reply = await interaction.reply({
		content: 'Please select the corresponding label to train the bot.',
		components: [row],
		ephemeral: true
	});

	const collector = reply.createMessageComponentCollector({
		componentType: ComponentType.StringSelect,
		time: 15000
	});

	const interactedMessage = message
		? message.content
		: interaction.targetMessage.content.toLowerCase();
	collector.on('collect', (i) => {
		helper.sendTrainData(interactedMessage, i.values[0]);

		i.reply({ content: 'Sent train data to server.', ephemeral: true });
	});
}
