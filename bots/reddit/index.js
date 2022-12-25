import Snoowrap from 'snoowrap';
import { SubmissionStream, CommentStream } from 'snoostorm';
import { readFileSync, readdirSync } from 'node:fs';
// Fix __dirname not being defined in ES modules. (https://stackoverflow.com/a/64383997)
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import HelperClient from '../../client/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default async () => {
	const config = JSON.parse(readFileSync('./config.json', 'utf-8'));

	const client = new Snoowrap(config.reddit);
	const helper = new HelperClient(config);

	helper.connect();

	client.commands = new Map();

	const commandsPath = join(__dirname, 'commands');
	const commandFiles = readdirSync(commandsPath).filter((file) =>
		file.endsWith('.js')
	);

	for (const file of commandFiles) {
		const filePath = join(commandsPath, file);
		const command = (await import(`file://${filePath}`)).default;
		if ('command' in command && 'execute' in command) {
			client.commands.set(command.command, command);
		} else {
			console.log(
				`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
			);
		}
	}

	const checkedItems = [];

	const args = {
		subreddit: 'revancedapp',
		limit: 10,
		pollTime: 5000
	};

	const comments = new CommentStream(client, args);

	const posts = new SubmissionStream(client, args);

	comments.on('item', async (item) => {
		await handleItem(item, false);
	});

	posts.on('item', async (item) => {
		await handleItem(item, true);
	});

	async function handleItem(item, isPost) {
		// The "skill issue (refresh)" incident.
		if (item.author.name === config.reddit.username) return;

		if (checkedItems.includes(item.id)) return;
		checkedItems.push(item.id);
		if (isPost) {
			// It's a post, we have to also send post body.
			helper.scanText(item.title.toLowerCase(), `post/${item.id}`);
			helper.scanText(item.selftext.toLowerCase(), `post/${item.id}`);
		} else {
			const body = item.body.toLowerCase();
			if (body.startsWith(`u/${config.reddit.username.toLowerCase()}`)) {
				const args = body
					.replace(`u/${config.reddit.username.toLowerCase()} `, '')
					.split(' ');
				const command = args[0];
				args.shift();

				if (!client.commands.get(command)) return;

				await client.commands.get(command).execute(client, helper, item, args);
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
			helper.once(event.name, (...args) =>
				event.execute(client, config, ...args)
			);
		} else {
			helper.on(event.name, (...args) => event.execute(client, config, ...args));
		}
	}
}