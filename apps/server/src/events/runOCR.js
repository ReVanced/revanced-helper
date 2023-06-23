import { createWorker } from 'tesseract.js';
import { serialize } from 'bson';
import EventEmitter from 'node:events';

const worker = await createWorker();
await worker.loadLanguage('eng');
await worker.initialize('eng');

async function recognize({ client, data }) {
    const { data: { text } } = await worker.recognize(data.url);

    client.write(
        serialize({
            op: 6,
            id: data.id,
            ocrText: text
        })
    );
}

class Queue extends EventEmitter {
    constructor() {
        super();
        this.isRunning = false;
        this.items = []
    }

    push(item) {
        this.items.push(item);
        this.emit('item', item)
    }

    shift() {
        return this.items.shift();
    }

}

const queue = new Queue();

queue.on('item', async ({ client, data }) => {
    if (!queue.isRunning) {
        queue.isRunning = true;
        await recognize(queue.items.shift());
        queue.isRunning = false;
        queue.emit('finished');
    }
});

queue.on('finished', async () => {
    if (queue.items.length !== 0) {
        queue.isRunning = true;
        await recognize(queue.items.shift());
        queue.isRunning = false;
        queue.emit('finished');
    }
});

export default async function runOCR(client, data) {
    queue.push({ client, data });
}
