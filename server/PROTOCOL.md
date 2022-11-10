# Server Protocol

The server uses TCP for connection and BSON for messages, so you need to serialize and deserialize the messages.

# AI

Sending the server this JSON (BSON) will send you back the AI predictions.

```json
{
    "event": "ai",
    "id": "String", 
    "text": "How do i download ReVanced?"
}
```

And the server would return something like this:

```json
{
    "event": "ai_response",
    "id": "String",
    "predictions": [
        {
            "label": "DOWNLOAD",
            "score": "1"
        }
    ]
}
```

# OCR

Soon:tm:

# Training the AI

To add data to the train data, send a BSON (JSON) like this:

```json
{
    "event": "add_train_data",
    "label": "FALSEPOSITIVE",
    "text": "how"
}
```

To train the AI and to re-load it, send this BSON (JSON):

```json
{
    "event": "train_ai"
}
```