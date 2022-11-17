import Snoowrap from 'snoowrap';
import { SubmissionStream, CommentStream } from 'snoostorm';
import { readFileSync } from 'node:fs';
import HelperClient from '../../client/index.js';

const configJSON = readFileSync('../config.json', 'utf-8');
global.config = JSON.parse(configJSON);

global.client = new Snoowrap(global.config.reddit);
const helper = new HelperClient(global.config);

helper.connect();

const BOT_START = Date.now() / 1000;
global.checkedItems = [];

const args = {
    subreddit: 'revancedapp',
    limit: 10,
    pollTime: 5000
}

const comments = new CommentStream(global.client, args);

const posts = new SubmissionStream(global.client, args);

comments.on('item', (item) => {
    if (item.created_utc < BOT_START) return;
    handleItem(item);
});

posts.on('item', (item) => {
    if (item.created_utc < BOT_START) return;
    handleItem(item);
});

function handleItem(item) {
    console.log(item);
    if (global.checkedItems.includes(item.id)) return;
    if (item.hasOwnProperty('over_18')) {
        // It's a post, we have to also send post body.
        helper.scanText(item.title.toLowerCase(), `post/${item.id}`);
        helper.scanText(item.selftext.toLowerCase(), `post/${item.id}`);
    } else {
        // It's a comment!
        helper.scanText(item.body.toLowerCase(), `comment/${item.id}`);
    }
}

// Feel free to add an event handler.

helper.on('aiResponse', async (aiRes) => {
    const response = global.config.responses.find(
        (res) => res.label === aiRes.predictions[0].label
    );
    if (!response) return;

    if (Number(aiRes.predictions[0].score) >= response.threshold) {
        const ids = aiRes.id.split('/');

        if (!response.text) return;

        switch (ids[0]) {
            case 'comment': {
                client.getComment(ids[1]).reply(response.text);
                global.checkedItems.push(ids[1]);
                break;
            };

            case 'post': {
                client.getSubmission(ids[1]).reply(response.text);
                global.checkedItems.push(ids[1]);
                break;
            }
        }

        return;
    }
});