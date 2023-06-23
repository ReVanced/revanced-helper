import { ContextMenuCommandBuilder, ApplicationCommandType } from 'discord.js';
import trainAISelectMenu from '../utils/trainAISelectMenu.js';

export default {
	data: new ContextMenuCommandBuilder()
		.setName('Train Message')
		.setType(ApplicationCommandType.Message),
	async execute(helper, config, interaction) {
		if (
			interaction.member.roles.highest.comparePositionTo(
				interaction.member.guild.roles.cache.get(config.discord.trainRole)
			) < 0
		)
			return interaction.reply({
				content: 'You don\'t have the permission to do this.',
				ephemeral: true
			});

		trainAISelectMenu(interaction, config, helper);
	}
};
