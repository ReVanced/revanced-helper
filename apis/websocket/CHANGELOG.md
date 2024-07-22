# @revanced/bot-websocket-api 1.0.0-dev.1 (2024-07-22)


### Bug Fixes

* **apis/websocket:** builds not working due to dynamic import requirement ([fc7be22](https://github.com/revanced/revanced-helper/commit/fc7be22c6c15974c7394790e93de2a23a6627153))
* **apis/websocket:** don't bundle `tesseract.js` ([51a6fb6](https://github.com/revanced/revanced-helper/commit/51a6fb65f0df3409eacffb297430840a0e326989))
* **apis/websocket:** fix forever stuck Promise ([168f40d](https://github.com/revanced/revanced-helper/commit/168f40def64ca213cd2b549f4bafed4c0e1e3695))
* **apis/websocket:** fix undefined error ([2f03800](https://github.com/revanced/revanced-helper/commit/2f03800c61c00e59e512567d273a195e605d6736))
* **apis/websocket:** improve logging and error handling ([b6cbe9d](https://github.com/revanced/revanced-helper/commit/b6cbe9d64c01ff11feab8351fb801bc1aee48325))
* remove error cb handling for `socket.send()` calls ([29544d4](https://github.com/revanced/revanced-helper/commit/29544d4e0127173465796b7e3c62161f4db59c8b))
* **types:** fix issues with typings ([669e24c](https://github.com/revanced/revanced-helper/commit/669e24ca8103ea051b4e61160dd0f978e36707ea))


### chore

* fix more build issues ([77fefb9](https://github.com/revanced/revanced-helper/commit/77fefb9bef286a22f40a4d76b79c64fcc5a2467f))


### Features

* **apis/websocket:** clear old client sessions and instances ([43bd0a0](https://github.com/revanced/revanced-helper/commit/43bd0a021cd885a3d74a1f307ec2935e81d17458))
* **packages/shared:** add logger factory ([17c6be7](https://github.com/revanced/revanced-helper/commit/17c6be7bee5b5c24fd4a5279e73374b0bb7a6229))


### BREAKING CHANGES

* In `@revanced/discord-bot`, its environment variable
                 `DATABASE_URL` has been renamed to `DATABASE_PATH`
                 and the `file:` prefix is no longer needed
