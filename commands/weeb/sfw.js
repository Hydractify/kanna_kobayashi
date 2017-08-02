const Command = require('../../cogs/commands/framework');
const ibsearch = require('../../util/embeds/ibsearch');

module.exports = class SFW extends Command {
    constructor() {
        super(
            {
                name: 'sfw',
                alias: ['ibsearch'],
                usage: 'sfw <tag>',
                examples: ['sfw mario', 'sfw weeb'],
                enabled: true
            });
    }

    async run(message, color, args) {
        if (args.includes('%')
            || args.includes('?')
            || args.includes('!')
            || args.includes('.')
            || args.includes(':')) {
            return message.channel.send(`Hey ${message.author}, you've input something that could break the search!`);
        }

        const embed = await ibsearch(color, message, args);

        if (!embed) return message.channel.send('Could not find anything or an error happened during the request.');

        return message.channel.send({ embed });
    }
};
