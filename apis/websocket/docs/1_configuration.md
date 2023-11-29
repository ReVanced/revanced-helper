# ⚙️ Configuration

This is the default configuration:

```json
{
    "address": "127.0.0.1",
    "port": 3000,
    "ocrConcurrentQueues": 1,
    "clientHeartbeatInterval": 60000,
    "debugLogsInProduction": false
}
```

---

### `config.address` & `config.port`

The address and port for the server to listen on.

### `config.ocrConcurrentQueues`

Amount of concurrent queues that can be run at a time.

> Setting this too high may cause performance issues.

### `config.clientHeartbeatInterval`

Heartbeat interval for clients. See [**💓 Heartbeating**](./packets.md#💓-heartbeating).

### `config.consoleLogLevel`

The level of logs to print to console. If the level is more important or equally important to set level, it will be forwarded to the console.

The possible levels (sorted by their importance descendingly) are:
- `fatal`
- `error`
- `warn`
- `info`
- `log`
- `trace`
- `debug`

## ⏭️ What's next

The next page will tell you how to run and bundle the server.

Continue: [🏃🏻‍♂️ Running the server](./2_running.md)
