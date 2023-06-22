let trainData = [];

setInterval(() => {
    if (trainData.length == 0) return;

    fetch('https://api.wit.ai/utterances', {
        headers: {
            authorization: `Bearer ${process.env.WIT_AI_TOKEN}`
        },
        body: JSON.stringify(trainData),
        method: 'POST'
    });

    trainData = [];
}, 60 * 1000)

export default async function trainAI(data) {
    const inArray = trainData.find((el) => el.text == data.text);

    // Check if an already existing training data exists
    // and if it does, replace the intent.
    if (inArray) {
        const trainDataElement = trainData.indexOf(inArray);
        
        trainData[trainDataElement].intent = data.label;

        return;
    }
    trainData.push([
        {
            text: data.text,
            intent: data.label,
            entities: [],
            traits: []
        }
    ]);
    return;
}
