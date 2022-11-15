import { readFileSync } from 'node:fs';
// Fix __dirname not being defined in ES modules. (https://stackoverflow.com/a/64383997)
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
global.__dirname = dirname(__filename);

const configJSON = readFileSync('./config.json', 'utf-8');
const config = JSON.parse(configJSON);
global.config = config;
import { createServer } from 'node:net';
import { deserialize } from 'bson';
import FastText from 'fasttext.js';
import { runAI, trainAI, runOCR, addTrainData } from './events/index.js';

const ft = new FastText(global.config.fasttext);

ft.load();

// I'm sorry. This is probably the only solution.
global.ft = ft;

const server = createServer(async (client) => {
    client.on('data', async (data) => {
        const eventData = deserialize(data, { allowObjectSmallerThanBufferSize: true });

        switch(eventData.op) {
            case 1: {
                runAI(client, eventData);
                break;
            };

            case 3: {
                addTrainData(eventData);
                break;
            };

            case 4: {
                trainAI();
                break;
            
            };

            case 5: {
                runOCR(client, eventData);
                break;
            };
        };

    });
});

server.listen(global.config.server.port || 3000);