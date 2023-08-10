import { Events } from 'discord.js';
import setMuteTimeout from '../utils/setMuteTimeout.js';

export default {
	name: Events.ClientReady,
	once: false,
	async execute(_, config, client) {
       console.log('Client is ready. Reloading mutes.');
       
       const mutes = await client.db.collection('muted').find().toArray();

       for (const mute of mutes) {
           await setMuteTimeout(mute, client.mutes, client);
       }

       console.log(`Loaded ${mutes.length} mutes.`);
	}
};
