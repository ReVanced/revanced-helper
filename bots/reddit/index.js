import Snoowrap from 'snoowrap';
import { SubmissionStream, CommentStream } from 'snoostorm';
import { readFileSync, readdirSync } from 'node:fs';
// Fix __dirname not being defined in ES modules. (https://stackoverflow.com/a/64383997)
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import HelperClient from '../../client/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const configJSON = readFileSync('../config.json', 'utf-8');
global.config = JSON.parse(configJSON);

global.client = new Snoowrap(global.config.reddit);
const helper = new HelperClient(global.config);
global.client.helper = helper;

helper.connect();

global.client.commands = new Map();
global.client.helper = helper;

const commandsPath = join(__dirname, 'commands');
const commandFiles = readdirSync(commandsPath).filter((file) =>
	file.endsWith('.js')
);

for (const file of commandFiles) {
	const filePath = join(commandsPath, file);
	const command = (await import(`file://${filePath}`)).default;
	if ('command' in command && 'execute' in command) {
		global.client.commands.set(command.command, command);
	} else {
		console.log(
			`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
		);
	}
}

const BOT_START = Date.now() / 1000;
global.checkedItems = [];

const args = {
	subreddit: 'revancedapp',
	limit: 10,
	pollTime: 5000
};

const comments = new CommentStream(global.client, args);

const posts = new SubmissionStream(global.client, args);

comments.on('item', async (item) => {
	if (item.created_utc < BOT_START) return;
	await handleItem(item, false);
});

posts.on('item', async (item) => {
	//if (item.created_utc < BOT_START) return;
	await handleItem(item, true);
});

async function handleItem(item, isPost) {
	// The "skill issue (refresh) incident."
	if (item.author.name === global.config.reddit.username) return;

	if (global.checkedItems.includes(item.id)) return;
	global.checkedItems.push(item.id);
	if (isPost) {
		// It's a post, we have to also send post body.
		helper.scanText(item.title.toLowerCase(), `post/${item.id}`);
		helper.scanText(item.selftext.toLowerCase(), `post/${item.id}`);
	} else {
		const body = item.body.toLowerCase();
		if (body.startsWith(`u/${global.config.reddit.username.toLowerCase()}`)) {
			const args = body
				.replace(`u/${global.config.reddit.username.toLowerCase()} `, '')
				.split(' ');
			const command = args[0];
			args.shift();

			if (!global.client.commands.get(command)) return;

			await global.client.commands
				.get(command)
				.execute(global.client, item, args);
		} else helper.scanText(item.body.toLowerCase(), `comment/${item.id}`);
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
		helper.once(event.name, (...args) => event.execute(...args));
	} else {
		helper.on(event.name, (...args) => event.execute(...args));
	}
}
