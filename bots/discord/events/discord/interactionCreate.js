import { Events } from 'discord.js';

export default {
	name: Events.InteractionCreate,
	once: false,
	async execute(helper, config, interaction) {
		if (!interaction.isMessageContextMenuCommand()) {
			if (!interaction.isChatInputCommand()) return;
		}

		const command = interaction.client.commands.get(interaction.commandName);

		if (!command) {
			console.error(
				`No command matching ${interaction.commandName} was found.`
			);
			return;
		}

		try {
			await command.execute(helper, config, interaction);
		} catch (error) {
			console.error(error);
			await interaction.reply({
				content: 'There was an error while executing this command!',
				ephemeral: true
			});
		}
	}
};