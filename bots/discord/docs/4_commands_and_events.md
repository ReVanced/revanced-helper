# ✨ Adding commands and listening to events

Adding commands and listening to new events is easy once you learn the project's structure.

## 🗄️ Project structure

In the source directory, you'll find multiple other directories:

-   [Commands](#💬-commands) are located in `src/commands`
-   [Events](#🚩-events) are located in `src/events`
-   [Utility functions](../src/utils) are located in `src/utils`

You'll also find multiple files:

-   [`index.ts`](../src/index.ts) is the entry of the bot
-   [`context.ts`](../src/context.ts) is the context object that will be referenced in multiple places

## 💬 Commands

> [!IMPORTANT]  
> You are currently developing with the temporary system which isn't very great in terms of development experience.  
> A new system will be made and pushed soon and all commands will be migrated to it.

If you feel the need to categorize commands into directories, you absolutely can, as the system does not restrict subdirectories.

You can start developing commands with this template:

```ts
// src/commands/my-command.ts

import { SlashCommandBuilder } from "discord.js";
import type { Command } from ".";

export default {
    data: new SlashCommandBuilder()
        .setName("my-command")
        .setDescription("My cool command")
        // Allowing this command to be used in DMs
        .setDMPermission(true)
        // DO NOT forget this line!
        .toJSON(),

    // Member requirements, will only apply to
    memberRequirements: {
        // Match mode, can be `all` or `any` (`all` by default)
        // - All mode means all of the following conditions have to match
        // - Any mode means one of the following conditions have to match
        mode: "all",
        // This will always match in Any mode, which means the member must have one of these roles to pass
        roles: ["955220417969262612", "973886585294704640"],
        // Permissions required to execute this command
        // -1n means bot owners only (default for security reasons)
        permissions: -1n,
    },

    // Whether this command should be able to be executed by only bot owners
    // (true by default)
    ownerOnly: false,

    // Whether to register this command globally
    // This is turned off by default for security reasons
    global: true,

    // What to do when this command executes
    async execute(_context, interaction) {
        await interaction.reply({
            content: "Hello!",
        });
    },
} satisfies Command;
```

## 🚩 Events

Events are a bit different. We have 2 different event systems for both Discord API and our own bot API. This means the [`src/events`](../src/events) directory will have 2 separate directories inside. They are specific to the respective API, but the utility functions make the experience with both of them very similar.

To start adding events, you can use this template:

```ts
// For Discord events (remove functions you do not use)
import { on, once } from '$utils/discord/events'

// You will have auto-complete and types for all of them, don't worry!
// WARNING: The first argument is the `context` object for Discord events
//          This is intended by design because Discord events usually always use it.
on('eventName', async (context, arg1, arg2, ...) => {
    // Do something in here when the event is triggered
})
```

```ts
// For "Helper" events (remove functions you do not use)
import { on, once } from '$utils/api/events'

// You will have auto-complete and types for all of them, don't worry!
on('eventName', async (arg1, arg2, ...) => {
    // Do something in here when the event is triggered
})
```

API events are stored in [`src/events/api`](../src/events/api), and Discord events are in [`src/events/discord`](../src/events/discord).

> [!NOTE]  
> If you need multiple event listeners for the same exact event, you can put them in a directory with the event name and rename the listeners to what they handle specifically. You can see how we do it in [`src/events/discord/interactionCreate`](../src/events/discord/interactionCreate).

## ⏭️ What's next

The next page will tell you how to create and interact with a database.

Continue: [🫙 Storing data](./5_databases.md)
