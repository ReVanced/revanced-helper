import { Events } from 'discord.js';

export default {
	name: Events.InteractionCreate,
	once: false,
	async execute(interaction) {
		if (
			!interaction.isMessageContextMenuCommand() ||
      !interaction.isChatInputCommand()
		)
			return;

		const command = interaction.client.commands.get(interaction.commandName);

		if (!command) {
			console.error(
				`No command matching ${interaction.commandName} was found.`
			);
			return;
		}

		try {
			await command.execute(interaction);
		} catch (error) {
			console.error(error);
			await interaction.reply({
				content: 'There was an error while executing this command!',
				ephemeral: true
			});
		}
	}
};
