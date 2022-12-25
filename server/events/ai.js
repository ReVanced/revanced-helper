import { serialize } from 'bson';

async function generateResponse(tokenizer, model, config, dialog) {
	const knowledge = `[KNOWLEDGE] ${config.knowledge.join(' ')}`;
	const context = `[CONTEXT] ${dialog.substring(0, 64)}`;

	const query = `${config.instruction} ${context} ${knowledge}`;

	const inputTokenIds = tokenizer.encode(query);
	const outputTokenIds = await model.generate(inputTokenIds, { maxLength: 64, topK: 10 });
	return await tokenizer.decode(outputTokenIds, true);
}

export default async function runAI(client, data, tokenizer, model, config) {
	const response = await generateResponse(tokenizer, model, config, data.text);

	client.write(
		serialize({
			op: 2,
			id: data.id,
			response
		})
	);

	return;
}
