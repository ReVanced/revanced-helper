export default async function runAI(data, config) {
	fetch('https://api.wit.ai/utterances', {
		headers: {
			authorization: `Bearer ${config.authToken}`
		},
		body: JSON.stringify([
			{
				text: data.text,
				intent: data.label,
				entities: [],
				traits: []
			}
		]),
		method: 'POST'
	});

	return;
}
