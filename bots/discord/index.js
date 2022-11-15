import { Client, Events, GatewayIntentBits } from 'discord.js';
import { readFileSync } from 'node:fs';
import HelperClient from '../../client/index.js';

const configJSON = readFileSync('../config.json', 'utf-8');
const config = JSON.parse(configJSON);

const helper = new HelperClient(config);

helper.connect();

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

client.on(Events.MessageCreate, async (msg) => {
    helper.scanText(msg.content, `${msg.channelId}/${msg.id}`);
});

client.on(Events.InteractionCreate, async (interaction) => {

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