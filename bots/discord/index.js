import { Client, Events, GatewayIntentBits } from 'discord.js';
import { readFileSync } from 'node:fs';

const configJSON = readFileSync('../config.json', 'utf-8');
const config = JSON.parse(configJSON);

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });

client.on(Events.MessageCreate, async (msg) => {

});

client.on(Events.InteractionCreate, async (interaction) => {

});

client.login(config.discord.token);