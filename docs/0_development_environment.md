# 🏗️ Setting up the development environment

> [!IMPORTANT]  
> **This project uses [Bun](https://bun.sh) to run and bundle the code.**  
> Compatibility with other runtimes (Node.js, Deno, ...) are not guaranteed and most package scripts won't work.

To start developing, you'll need to set up the development environment first.

1. Install [Bun](https://bun.sh)

2. Clone the mono-repository

    ```sh
    git clone https://github.com/revanced/revanced-helper.git &&
    cd revanced-helper
    ```

3. Install dependencies

    ```sh
    bun install
    ```

4. Build packages/libraries

    ```sh
    bun run build
    ```

5. Change your directory to a project's root
    ```sh
    # WebSocket API
    cd apis/websocket

    # Discord bot
    cd bots/discord

    # Programmatic API
    cd packages/api

    # Etc.
    ```

## ⏭️ What's next

You'll need to go to the respective project's documentation to continue.
