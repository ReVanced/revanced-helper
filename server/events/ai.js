import { serialize } from 'bson';

export default async function runAI(client, data, config) {
	const witAIReq = await fetch(`https://api.wit.ai/message?v20230319&q=${encodeURI(data.text)}`, {
		headers: {
			authorization: `Bearer ${config.authToken}`
		}
	});

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
