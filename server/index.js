import { createServer } from 'node:net';
import { deserialize } from 'bson';
import FastText from 'fasttext.js';
import { runAI, trainAI } from './events/index.js';

const ft = new FastText({
    loadModel: './model/model.bin'
});

ft.load();

const server = createServer(async (client) => {
    client.on('data', async (data) => {
        const eventData = deserialize(data);

        switch(eventData.event) {
            case 'ai': {
                runAI(client, eventData, ft.predict);
                break;
            }

            case 'train_ai': {
                trainAI(ft.unload, ft.load);
                break;
            }
        }

    });
});

server.listen(process.env.PORT || 3000);