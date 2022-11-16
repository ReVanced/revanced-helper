import { serialize } from 'bson';

export default async function runAI(client, data) {
	const predictions = await global.ft.predict(data.text);
	const jsonData = {
		op: 2,
		id: data.id,
		predictions
	};

	const bsonData = serialize(jsonData);
	client.write(bsonData);

	return;
}
