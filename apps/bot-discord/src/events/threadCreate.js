import { Events } from 'discord.js';

export default {
	name: Events.ThreadCreate,
	once: false,
	async execute(helper, _, thread) {
       // TODO: Implement this (failed to get the first message in the thread)
	}
};
