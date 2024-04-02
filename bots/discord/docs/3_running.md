# 🏃🏻‍♂️ Running the bot

There are two methods to run the bot. Choose one that suits best for the situation.

## 👷🏻 Development mode (recommended)

There will be no compilation step, and Bun will automatically watch changes and restart the bot for you.

You can quickly start the bot by running:

```sh
bun dev
```

## 📦 Building

There's unfortunately no way to build/bundle the bot yet due to how dynamic imports currently work, though we have a few ideas that may work.
As a workaround, you can zip up the whole project, unzip, and run it in development mode using Bun.

## ⏭️ What's next

The next page will tell you how to add commands and listen to events to the bot.

Continue: [✨ Adding commands and listening to events](./4_commands_and_events.md)
