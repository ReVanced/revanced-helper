import { recognize } from 'node-tesseract-ocr';
import { serialize } from 'bson';

export default async function runOCR(client, eventData) {
	const config = {
		lang: 'eng',
		oem: 3,
		psm: 3
	};

	const ocrText = await recognize(eventData.url, config);

	const jsonData = {
		op: 6,
		id: eventData.id,
		ocrText
	};

	const bsonData = serialize(jsonData);
	client.write(bsonData);

	return;
}
