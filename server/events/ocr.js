import { recognize } from 'node-tesseract-ocr';
import { serialize } from 'bson';

const config = {
	lang: 'eng',
	oem: 3,
	psm: 3
};

export default async function runOCR(client, eventData) {
	const ocrText = await recognize(eventData.url, config);

	client.write(
		serialize({
			op: 6,
			id: eventData.id,
			ocrText
		})
	);

	return;
}
