# ⚙️ Configuration

This is the default configuration (provided in [config.ts](../config.ts)):

```ts
export default {
    owners: ["USER_ID_HERE"],
    allowedGuilds: ["GUILD_ID_HERE"],
    messageScan: {
        channels: ["CHANNEL_ID_HERE"],
        roles: ["ROLE_ID_HERE"],
        users: ["USER_ID_HERE"],
        whitelist: false,
        humanCorrections: {
            falsePositiveLabel: "false_positive",
            allowUsers: ["USER_ID_HERE"],
            memberRequirements: {
                permissions: 8n,
                roles: ["ROLE_ID_HERE"],
            },
        },
        allowedAttachmentMimeTypes: ["image/jpeg", "image/png", "image/webp"],
        responses: [
            {
                triggers: [/^regexp?$/, { label: "label", threshold: 0.85 }],
                response: {
                    title: "Embed title",
                    description: "Embed description",
                    fields: [
                        {
                            name: "Field name",
                            value: "Field value",
                        },
                    ],
                },
            },
        ],
    },
    logLevel: "log",
    api: {
        websocketUrl: "ws://127.0.0.1:3000",
    },
} as Config;
```

This may look very overwhelming but configurating it is pretty easy.

---

### `config.owners`

User IDs of the owners of the bot. They'll be able to execute specific commands that others can't and take control of the bot.

### `config.allowedGuilds`

Servers the bot is allowed to be and register commands in. The bot will leave servers that are not in this list automatically once detected.

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

The WebSocket URL to connect to (including port).

### `config.messageScan`

Message scan configuration.

##### `config.messageScan.roles` & `config.messageScan.users` & `config.messageScan.channels`

Roles, users, and channels which will be affected by the blacklist/whitelist rule.

##### `config.messageScan.whitelist`

Whether to use whitelist (`true`) or blacklist (`false`) mode.

-   Blacklist mode **will refuse** to scan messages of any roles or users who **are** in the list above.
-   Whitelist mode **will refuse** to scan messages of any roles or users who **aren't** in the list above.

##### `config.messageScan.responses`

An array containing response configurations. A response can be triggered by multiple ways[^1], which can be specified in the `response.triggers` field.
The `response` field contains the embed data that the bot should send. If it is set to `null`, the bot will not send a response or delete the current response if editing.

```ts
{
    triggers: [
        /cool regex/i,
        {
            label: 'some_label',
            threshold: 0.8,
        },
    ],
    response: {
        title: 'Embed title',
        description: 'Embed description',
        fields: [
            {
                name: 'Field name',
                value: 'Field value',
            },
        ],
    }
}
```

[^1]: Possible triggers are regular expressions or [label configurations](../config.example.ts#68).

## ⏭️ What's next

The next page will tell you how to run and bundle the bot.

Continue: [🏃🏻‍♂️ Running the bot](./2_running.md)
