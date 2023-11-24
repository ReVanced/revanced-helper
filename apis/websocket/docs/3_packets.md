# 📨 Packets

Packets are BSON messages sent to the server. They're structured like the following when decoded:

```json
{
    "op": 12345,
    "d": {
        "some_field": "some data"
    }
}
```

### `packet.op`

Operation codes are numbers that communicate an action.

### `packet.d`

Data fields include additional information for the server to process. They are **either an object with specific fields or just `null`**.

#### 📦 Schemas and constants

Schemas for packets and their respective data[^1], and the list of possible operation codes[^2] can be found in the `@revanced/bot-shared` package, with typings as well.

[^1]: [`@revanced/bot-shared/src/schemas/Packet.ts`](../../packages/shared/src/schemas/Packet.ts)
[^2]: [`@revanced/bot-shared/src/constants/Operation`](../../packages/shared/src/constants/Operation.ts)

## 💓 Heartbeating

Heartbeating is a process where the client regularly send each other signals to confirm that they are still connected and functioning. If the server doesn't receive a heartbeat from the client within a specified timeframe, it assume the client has disconnected and closes the socket.

You can configure the interval in the configuration file. See [**📝&nbsp;Configuration&nbsp;>&nbsp;`config.clientHeartbeatInterval`**](./1_configuration.md#configclientheartbeatinterval).
