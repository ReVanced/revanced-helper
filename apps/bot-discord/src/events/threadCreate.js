import { Events } from 'discord.js';

export default {
	name: Events.ThreadCreate,
	once: false,
	async execute(helper, _, thread) {
       helper.scanText(thread.name.toLowerCase(), thread.id);
	}
};
