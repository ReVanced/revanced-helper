import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

export default function addTrainData(eventData) {
	const file = readFileSync(
		join(global.__dirname, global.config.fasttext.trainFile),
		'utf-8'
	);
	const { label, text } = eventData;

	if (file.includes(text)) return;
	
	const data = file.split('\n');

	const labelIndex = data.findIndex((data) => data.startsWith(label));

	data.splice(labelIndex === -1 ? 0 : labelIndex, 0, `${label} ${text}`);

	writeFileSync(
		join(global.__dirname, global.config.fasttext.trainFile),
		data.join('\n')
	);

	return;
}
