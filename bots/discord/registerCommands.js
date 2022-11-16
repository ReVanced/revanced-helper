import { REST, Routes } from 'discord.js';
import { readdirSync, readFileSync } from 'node:fs';
const configJSON = readFileSync('../config.json', 'utf-8');
const config = JSON.parse(configJSON);

const commands = [];
// Grab all the command files from the commands directory you created earlier
const commandFiles = readdirSync('./commands').filter(file => file.endsWith('.js'));

// Grab the SlashCommandBuilder#toJSON() output of each command's data for deployment
for (const file of commandFiles) {
	const command = await import(`./commands/${file}`);
	commands.push(command.default.data.toJSON());
}

// Construct and prepare an instance of the REST module
const rest = new REST({ version: '10' }).setToken(config.discord.token);

try {
    console.log(`Started refreshing ${commands.length} application (/) commands.`);

    // The put method is used to fully refresh all commands in the guild with the current set
    const data = await rest.put(
        Routes.applicationCommands(config.discord.id),
        { body: commands },
    );

    console.log(`Successfully reloaded ${data.length} application (/) commands.`);
} catch (error) {
    // And of course, make sure you catch and log any errors!
    console.error(error);
}