import { Client, GatewayIntentBits, Collection } from 'discord.js';
import { readFileSync, readdirSync } from 'node:fs';
// Fix __dirname not being defined in ES modules. (https://stackoverflow.com/a/64383997)
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
import HelperClient from '../../client/index.js';

export default async () => {
	const config = JSON.parse(readFileSync('./config.json', 'utf-8'));

	const helper = new HelperClient(config);

	helper.connect();

	const client = new Client({
		intents: [
			GatewayIntentBits.Guilds,
			GatewayIntentBits.GuildMessages,
			GatewayIntentBits.MessageContent
		]
	});

	client.commands = new Collection();

	const commandsPath = join(__dirname, 'commands');
	const commandFiles = readdirSync(commandsPath).filter((file) =>
		file.endsWith('.js')
	);

	for (const file of commandFiles) {
		const filePath = join(commandsPath, file);
		const command = (await import(`file://${filePath}`)).default;
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		} else {
			console.log(
				`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
			);
		}
	}

	const discordEventsPath = join(__dirname, 'events/discord');
	const discordEventFiles = readdirSync(discordEventsPath).filter((file) =>
		file.endsWith('.js')
	);

	for (const file of discordEventFiles) {
		const filePath = join(discordEventsPath, file);
		const event = (await import(`file://${filePath}`)).default;
		if (event.once) {
			client.once(event.name, (...args) =>
				event.execute(helper, config, ...args)
			);
		} else {
			client.on(event.name, (...args) =>
				event.execute(helper, config, ...args)
			);
		}
	}

	// The ReVanced Helper events.

	const helperEventsPath = join(__dirname, 'events/helper');
	const helperEventFiles = readdirSync(helperEventsPath).filter((file) =>
		file.endsWith('.js')
	);

	for (const file of helperEventFiles) {
		const filePath = join(helperEventsPath, file);
		const event = (await import(`file://${filePath}`)).default;
		if (event.once) {
			helper.once(event.name, (...args) =>
				event.execute(client, config, ...args)
			);
		} else {
			helper.on(event.name, (...args) =>
				event.execute(client, config, ...args)
			);
		}
	}

	client.login(config.discord.token);
};
