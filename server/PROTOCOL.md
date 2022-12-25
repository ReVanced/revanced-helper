# Server Protocol

The server uses TCP for connection and BSON for messages, so you need to serialize and deserialize the messages.

# AI

Sending the server this JSON (BSON) will send you back the AI predictions.

```json
{
  "op": 1,
  "id": "String",
  "text": "How do i download ReVanced?"
}
```

And the server would return something like this:

```json
{
  "op": 2,
  "id": "String",
  "response": "I think the term afn is just a generic slang term for the app that allows you to modify the behavior of Dalvik based android application..."
}
```

# OCR

Sending the server this JSON (BSON) will send you back the read text.

```json
{
  "op": 5,
  "id": "String",
  "url": "https://cdn.discordapp.com/attachments/1033338556493606963/1033338557231796224/Screenshot_20221022-121318.jpg"
}
```

And the server would return something like this:

```json
{
  "op": 6,
  "id": "String",
  "ocrText": "..."
}
```
