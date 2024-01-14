# 🏗️ Setting up the development environment

> [!IMPORTANT]  
> **This project uses [Bun](https://bun.sh) to run and bundle the code.**  
> Compatibility with other runtimes (Node.js, Deno, ...) are not guaranteed and most package scripts won't work.

To start developing, you'll need to set up the development environment first.

1. Install [Bun](https://bun.sh)

2. Clone the mono-repository

    ```sh
    git clone https://github.com/ReVanced/revanced-helper.git &&
    cd revanced-helper
    ```

3. Install dependencies

    ```sh
    bun install
    ```

4. Build packages/libraries

    ```sh
    bun build:libs
    ```

5. Change your directory to this project's root
    ```sh
    cd apis/websocket
    ```

## ⏭️ What's next

The next page will tell you about server configurations.

Continue: [⚙️ Configuration](./1_configuration.md)
