import { ContextMenuCommandBuilder, ApplicationCommandType } from 'discord.js';
import trainAISelectMenu from '../utils/trainAISelectMenu.js';
import { checkForPerms } from '../utils/checkPerms.js';

export default {
	data: new ContextMenuCommandBuilder()
		.setName('Train Message')
		.setType(ApplicationCommandType.Message),
	async execute(helper, config, interaction) {
		if (
			checkForPerms(config, interaction.member)
		)
			return interaction.reply({
				content: 'You don\'t have the permission to do this.',
				ephemeral: true
			});

		trainAISelectMenu(interaction, config, helper);
	}
};
