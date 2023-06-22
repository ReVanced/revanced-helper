import trainAISelectMenu from '../utils/trainAISelectMenu.js';

export default {
	data: {
		name: 'fb-dislike'
	},
	async execute(helper, config, interaction) {
		if (
			interaction.member.roles.highest.comparePositionTo(
				config.discord.trainRole
			) < 0
		)
			return interaction.reply({
				content: 'You don\'t have the permission to do this.',
				ephemeral: true
			});

		trainAISelectMenu(interaction, config, helper);
	}
};
