export default {
    plugins:
        process.env.RELEASE_WORKFLOW_STEP === 'publish'
            ? [
                  [
                      '@semantic-release/exec',
                      {
                          publishCmd: 'bun run scripts/trigger-portainer-webhook.ts',
                      },
                  ],
              ]
            : [
                  '@codedependant/semantic-release-docker',
                  {
                      dockerImage: 'revanced-bot-websocket-api',
                      dockerRegistry: 'ghcr.io',
                      dockerProject: 'revanced',
                      dockerContext: '../..',
                      dockerPlatform: ['linux/amd64', 'linux/arm64'],
                  },
              ],
}
