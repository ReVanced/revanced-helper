import exileMemberToChannel from '../utils/exileMemberToChannel.js';
import { checkForPerms } from '../utils/checkSupporterPerms.js'
import muteMember from '../utils/muteMember.js';

export default {
    name: 'exile',
    async execute(msg, args, config) {
        if (!checkForPerms(config, msg.member)) return msg.reply('You don\'t have the permission to do this.');
        
        if (!msg.reference) return msg.reply('You did not reply to anyone!');
        const referencedMsg = await msg.channel.messages.fetch(msg.reference.messageId);
        let message = referencedMsg.content;
        if (args[0]) {
            if (isNaN(args[0])) return msg.reply('The argument you entered is not a number!');

            const msgsByAuthor = (await msg.channels.fetch({ limit: 50 })).filter(
                m => m.author.id === referencedMsg.author.id
            );
            message = msgsByAuthor.slice(Number(`-${args[0]}`));
        }

        await muteMember(config, referencedMsg.author, {
            supportMute: true
        });

        exileMemberToChannel(referencedMsg.author, msg.channel, message, config, false);
    }
}