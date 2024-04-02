# ⚙️ Configuration

You will need to copy `config.example.ts` to `config.ts` to be able to start the bot, as it is the default configuration.

---

### `config.owners`

User IDs of the owners of the bot. Only add owners when needed.

### `config.guilds`

Servers the bot is allowed to be and register commands in.

### `config.logLevel`

The level of logs to print to console. If the level is more important or equally important to set level, it will be forwarded to the console.

The possible levels (sorted by their importance descendingly) are:

-   `none`
-   `fatal`
-   `error`
-   `warn`
-   `info`
-   `log`
-   `debug`

### `config.api.websocketUrl`

The WebSocket URL to connect to (including port). Soon auto-discovery will be implemented.

### `config.messageScan`

[Please see the next page.](./2_adding_autoresponses.md)

## ⏭️ What's next

The next page will tell you how to configure auto-responses.

Continue: [🗣️ Adding auto-responses](./2_adding_autoresponses.md)
