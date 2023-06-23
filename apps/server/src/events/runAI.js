import { serialize } from 'bson';

export default async function runAI(client, data) {
    const witAIReq = await fetch(
		`https://api.wit.ai/message?v=20230215&q=${encodeURI(data.text)}`,
		{
			headers: {
				authorization: `Bearer ${process.env.WIT_AI_TOKEN}`
			}
		}
	);

	const response = await witAIReq.json();

	client.write(
		serialize({
			op: 2,
			id: data.id,
			response: response.intents
		})
	);

	return;
}