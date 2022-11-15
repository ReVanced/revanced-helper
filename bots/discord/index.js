import { Client, Events, GatewayIntentBits } from 'discord.js';
import { readFileSync } from 'node:fs';
import HelperClient from '../../client/index.js';

const configJSON = readFileSync('../config.json', 'utf-8');
const config = JSON.parse(configJSON);

const helper = new HelperClient(config.server);

helper.connect();

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });

client.on(Events.MessageCreate, async (msg) => {

});

client.on(Events.InteractionCreate, async (interaction) => {

});

// The ReVanced Helper events.

helper.on('aiResponse', async (aiRes) => {

});

helper.on('ocrResponse', async (aiRes) => {

});

client.login(config.discord.token);