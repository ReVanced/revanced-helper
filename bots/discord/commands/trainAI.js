import { SlashCommandBuilder } from 'discord.js';

export default {
	data: new SlashCommandBuilder()
		.setName('train')
		.setDescription('Train the AI.'),
	async execute(interaction) {
		if (!interaction.member.roles.cache.get(global.config.discord.trainingRole))
			return interaction.reply({
				content: 'You don\'t have the permission to do this.',
				ephemeral: true
			});

		interaction.client.helper.trainAI();

		interaction.reply({
			content: 'Sent the trainAI command to the server.',
			ephemeral: true
		});
	}
};
