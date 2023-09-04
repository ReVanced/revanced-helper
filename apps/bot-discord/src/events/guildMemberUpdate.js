import { Events } from 'discord.js';
import cureUsername from '../utils/cureUsername.js';

export default {
    name: Events.GuildMemberUpdate,
    once: false,
    async execute(_, _, _, newMember) {
        cureUsername(newMember);
    }
};
