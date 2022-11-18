import TelegramBot from 'node-telegram-bot-api';
import { readFileSync, readdirSync } from 'node:fs';
// Fix __dirname not being defined in ES modules. (https://stackoverflow.com/a/64383997)
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
import HelperClient from '../../client/index.js';

const config = JSON.parse(readFileSync('../config.json', 'utf-8'));

const helper = new HelperClient(config);
helper.connect();

const bot = new TelegramBot(config.telegram.token, { polling: true });

const commandsPath = join(__dirname, 'commands');
const commandFiles = readdirSync(commandsPath).filter((file) =>
	file.endsWith('.js')
);

for (const file of commandFiles) {
	const filePath = join(commandsPath, file);
	const command = (await import(`file://${filePath}`)).default;
	if ('command' in command && 'execute' in command) {
		bot.onText(command.command, (...args) =>
			command.execute(bot, config, ...args)
		);
	} else {
		console.log(
			`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
		);
	}
}

const tgEventsPath = join(__dirname, 'events/telegram');
const tgEventFiles = readdirSync(tgEventsPath).filter((file) =>
	file.endsWith('.js')
);

for (const file of tgEventFiles) {
	const filePath = join(tgEventsPath, file);
	const event = (await import(`file://${filePath}`)).default;
	if (event.once) {
		bot.once(event.name, (...args) => event.execute(bot, helper, ...args));
	} else {
		bot.on(event.name, (...args) => event.execute(bot, helper, ...args));
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
		helper.once(event.name, (...args) => event.execute(bot, config, ...args));
	} else {
		helper.on(event.name, (...args) => event.execute(bot, config, ...args));
	}
}
