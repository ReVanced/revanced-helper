export default async function trainAI(data) {
    fetch('https://api.wit.ai/utterances', {
        headers: {
            authorization: `Bearer ${process.env.WIT_AI_TOKEN}`
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
