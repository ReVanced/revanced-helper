import { readFileSync } from 'node:fs';
const config = JSON.parse(readFileSync('./config.json', 'utf-8'));

import { createServer } from 'node:net';
import { deserialize } from 'bson';
import { runAI, runOCR, trainAI } from './events/index.js';

const server = createServer(async (client) => {
	client.on('data', async (data) => {
		const eventData = deserialize(data, {
			allowObjectSmallerThanBufferSize: true
		});

		switch (eventData.op) {
		case 1: {
			runAI(client, eventData, config.witAI);
			break;
		}

		case 3: {
			trainAI(eventData, config.witAI);
			break;
		}

		case 5: {
			runOCR(client, eventData);
			break;
		}
		}
	});
});

server.listen(config.server.port || 3000);
