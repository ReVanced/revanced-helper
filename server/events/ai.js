import { serialize } from 'bson';

export default async function runAI(client, data, ft) {
	const predictions = await ft.predict(data.text);

	client.write(
		serialize({
			op: 2,
			id: data.id,
			predictions
		})
	);

	return;
}
