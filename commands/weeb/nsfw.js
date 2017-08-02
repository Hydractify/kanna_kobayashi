const Command = require('../../cogs/commands/framework');
const ibsearch_xxx = require('../../util/embeds/ibsearch_xxx');

module.exports = class NSFW extends Command {
    constructor() {
        super(
            {
                name: 'nsfw',
                alias: ['xxx'],
                usage: 'nsfw <tag>',
                examples: ['nsfw mario', 'nsfw weeb'],
                enabled: false
            });
    }

    async run(message, color, args) {
        if (!message.channel.nsfw) {
            return message.channel.send(`This channel doesn't have NSFW enabled <:lewd:320406420824653825>`);
        }

        if (args.includes('kanna') || args.includes('kobayashi') || args.includes('kamui')) {
            return message.channel.send(`${message.author}... What are you thinking... ? <:omfg:315264558279426048>`);
        }

        if (args.includes('%')
            || args.includes('?')
            || args.includes('!')
            || args.includes('.')
            || args.includes(':')) {
            return message.channel.send(`Hey ${message.author}, you've input something that could break the search!`);
        }

        const embed = await ibsearch_xxx(color, message, args);

        if (!embed) return message.channel.send('Could not find anything or an error happened during the request.');

        return message.channel.send({ embed });
    }
};

