import { $ } from 'execa'

const branch = (await $`git rev-parse --abbrev-ref HEAD`).stdout.trim()

export default {
    plugins:
        branch === 'main'
            ? [
                  [
                      '@codedependant/semantic-release-docker',
                      {
                          dockerImage: 'revanced-bot-websocket-api',
                          dockerRegistry: 'ghcr.io',
                          dockerProject: 'revanced',
                          dockerContext: '../..',
                          dockerPlatform: ['linux/amd64', 'linux/arm64'],
                          dockerArgs: {
                              GITHUB_ACTOR: null,
                              GITHUB_TOKEN: null,
                          },
                      },
                  ],
                  [
                      '@semantic-release/exec',
                      {
                          publishCmd: 'bun run scripts/trigger-portainer-webhook.ts',
                      },
                  ],
              ]
            : [],
}
