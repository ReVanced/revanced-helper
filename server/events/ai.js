import { serialize } from 'bson';

export default async function runAI(client, data, predict) {
    const predictions = await predict(data.text);
    const jsonData = {
        event: 'ai_response',
        id: data.id,
        predictions
    };

    const bsonData = serialize(jsonData);

    client.pipe(bsonData);
    
    return;
}