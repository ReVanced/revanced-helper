import { Events } from 'discord.js';
import cureUsername from '../utils/cureUsername.js';

export default {
    name: Events.GuildMemberUpdate,
    once: false,
    async execute(_, config, oldMember, newMember) {
        cureUsername(newMember);
    }
};
