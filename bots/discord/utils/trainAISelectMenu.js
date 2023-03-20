import {
    ActionRowBuilder,
	StringSelectMenuBuilder,
	ComponentType
} from 'discord.js';

export default async function trainAISelectMenu(interaction, config, helper) {
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

		collector.on('collect', (i) => {
			helper.sendTrainData(
				interaction.targetMessage.content.toLowerCase(),
				i.values[0].toUpperCase()
			);

			i.reply({ content: 'Sent train data to server.', ephemeral: true });
		});
}