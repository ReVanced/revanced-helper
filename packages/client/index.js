import { Socket } from 'node:net';
import { serialize, deserialize } from 'bson';
import EventEmitter from 'node:events';

class HelperClient extends EventEmitter {
	constructor({ server }) {
		super();
		if (!server?.port) throw new Error('You did not specify the server port.');
		this.server = server;
		this.client = new Socket();
	}

	connect() {
		this.client.connect(
			this.server.port,
			this.server.host ? this.server.host : 'localhost'
		);

		this.client.on('data', (data) => {
			const eventData = deserialize(data, {
				allowObjectSmallerThanBufferSize: true
			});

			switch (eventData.op) {
				case 2: {
					// The 'aiResponse' event.

					this.emit('aiResponse', eventData);
					break;
				}

				case 6: {
					// The 'ocrResponse' event.

					this.emit('ocrResponse', eventData);
					break;
				}
			}
		});

		this.client.on('connect', () => {
			if (this.reconnectionInterval) {
				clearInterval(this.reconnectionInterval);
				this.reconnectionInterval = null;
			}

			this.emit('connect');
		});

		this.client.on('close', () => {
			this.reconnectionInterval = setInterval(() => {
				this.client.connect(
					this.server.port,
					this.server.host ? this.server.host : 'localhost'
				);
			}, 5000);
		})
	}

	sendData(data) {
		this.client.write(serialize(data));
		return;
	}

	scanText(text, id) {
		this.sendData({
			op: 1,
			id,
			text
		});

		return;
	}

	scanImage(url, id) {
		this.sendData({
			op: 5,
			id,
			url
		});

		return;
	}

	sendTrainData(text, label) {
		this.sendData({
			op: 3,
			label,
			text
		});

		return;
	}

	trainAI() {
		this.sendData({ op: 4 });

		return;
	}
}

export default HelperClient;
