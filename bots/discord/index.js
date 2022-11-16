import { Client, Events, GatewayIntentBits, Collection } from 'discord.js';
import { readFileSync, readdirSync } from 'node:fs';
// Fix __dirname not being defined in ES modules. (https://stackoverflow.com/a/64383997)
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
import HelperClient from '../../client/index.js';

const configJSON = readFileSync('../config.json', 'utf-8');
global.config = JSON.parse(configJSON);

const helper = new HelperClient(config);

helper.connect();

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

client.commands = new Collection();
client.helper = helper;

const commandsPath = join(__dirname, 'commands');
const commandFiles = readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const filePath = join(commandsPath, file);
	const command = (await import(`file://${filePath}`)).default;
	if ('data' in command && 'execute' in command) {
		client.commands.set(command.data.name, command);
	} else {
		console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
	}
}

client.on(Events.MessageCreate, async (msg) => {
    helper.scanText(msg.content, `${msg.channelId}/${msg.id}`);
});

client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isMessageContextMenuCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}
});

// The ReVanced Helper events.

helper.on('aiResponse', async (aiRes) => {
    const response = config.responses.find(res => res.label === aiRes.predictions[0].label);
    if (!response) return;

    if (Number(aiRes.predictions[0].score) >= response.threshold) {
        const ids = aiRes.id.split('/');
        let channel = client.channels.cache.get(ids[0]);

        if (!channel) {
            await client.channels.fetch(ids[0]);
            channel = client.channels.cache.get(ids[0]);
        }

        let message = channel.messages.cache.get(ids[1]);

        if (!message) {
            await channel.messages.fetch(ids[1]);
            message = channel.messages.cache.get(ids[1]);
        }

        message.reply(response.text);

        return;
    }
});

helper.on('ocrResponse', async (aiRes) => {

});

client.login(config.discord.token);