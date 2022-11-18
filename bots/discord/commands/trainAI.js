import { SlashCommandBuilder } from 'discord.js';

export default {
	data: new SlashCommandBuilder()
		.setName('train')
		.setDescription('Train the AI.'),
	async execute(helper, config, interaction) {
		if (!interaction.member.roles.cache.has(config.discord.trainingRole))
			return interaction.reply({
				content: 'You don\'t have the permission to do this.',
				ephemeral: true
			});

		helper.trainAI();

		interaction.reply({
			content: 'Sent the trainAI command to the server.',
			ephemeral: true
		});
	}
};
