# 🏃🏻‍♂️ Running the server

There are many methods to run the server. Choose one that suits best for the situation.

## 👷🏻 Development mode (recommended)

There will be no compilation step, and Bun will automatically watch changes and restart the server for you.

You can quickly start the server by running:

```sh
bun dev
```

## 🌐 Production mode

Production mode runs no different from the development server, it simply has less debugging information printed to console by default. However, more production-specific features may come.

To start the server in production mode, you'll have to:

1. Set the `NODE_ENV` environment variable to `production`

    > It is very possible to set the value in the `.env` file and let Bun load it, **but it is recommended to set the variable before Bun even starts**.

2. Start the server
    ```sh
    bun dev
    ```

## 📦 Building

If you're looking to build and host the server somewhere else, you can run:

```sh
bun bundle
```

The files will be placed in the `dist` directory. **Configurations and `.env` files will NOT be copied automatically.**

To start up the server, you'll need to install `tesseract.js` first.
```sh
bun install tesseract.js
# or
bun install tesseract.js -g

# Run the server
bun run index.js
```

## ⏭️ What's next

The next page will tell you about packets.

Continue: [📨 Packets](./3_packets.md)
