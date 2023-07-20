import Snoowrap from 'snoowrap';
import { SubmissionStream, CommentStream } from 'snoostorm';
import { readFileSync, readdirSync } from 'node:fs';
// Fix __dirname not being defined in ES modules. (https://stackoverflow.com/a/64383997)
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
import HelperClient from '@revanced-helper/helper-client';
import config from './config.json' assert { type: 'json' };

const helper = new HelperClient(config);
helper.connect();

const client = new Snoowrap({
    username: process.env.REDDIT_USERNAME,
    password: process.env.REDDIT_PASSWORD,
    userAgent: process.env.REDDIT_USER || 'RevancedHelper-Reddit',
    clientId: process.env.REDDIT_CLIENT_ID,
    clientSecret: process.env.REDDIT_CLIENT_SECRET
});

const checkedItems = [];

const args = {
    subreddit: process.env.REDDIT_SUBREDDIT || 'revancedapp',
    limit: 10,
    pollTime: 5_000
};

const comments = new CommentStream(client, args);

const posts = new SubmissionStream(client, args);

comments.on('item', async (item) => {
    await handleItem(item, false);
});

posts.on('item', async (item) => {
    await handleItem(item, true);
});

async function handleItem(item, isPost) {
    // The "skill issue (refresh)" incident.
    if (item.author.name === process.env.REDDIT_USERNAME) return;

    if (checkedItems.includes(item.id)) return;
    checkedItems.push(item.id);
    if (isPost) {
        // It's a post, we have to also send the posts body.
        helper.scanText(item.title.toLowerCase(), `post/${item.id}`);
        helper.scanText(item.selftext.toLowerCase(), `post/${item.id}`);
    } else {
        helper.scanText(item.body.toLowerCase(), `comment/${item.id}`);
    }
}

// The ReVanced Helper events.

const helperEventsPath = join(__dirname, 'helperEvents');
const helperEventFiles = readdirSync(helperEventsPath).filter((file) =>
    file.endsWith('.js')
);

for (const file of helperEventFiles) {
    const filePath = join(helperEventsPath, file);
    const event = (await import(`file://${filePath}`)).default;
    if (event.once) {
        helper.once(event.name, (...args) =>
            event.execute(client, config, ...args)
        );
    } else {
        helper.on(event.name, (...args) =>
            event.execute(client, config, ...args)
        );
    }
}
