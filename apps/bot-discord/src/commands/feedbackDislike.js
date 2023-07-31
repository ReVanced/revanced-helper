import { checkForPerms } from '../utils/checkSupporterPerms.js';
import trainAISelectMenu from '../utils/trainAISelectMenu.js';

export default {
	data: {
		name: 'fb-dislike'
	},
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
