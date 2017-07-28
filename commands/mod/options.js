const Discord = require('discord.js');
const Command = require('../../cogs/commands/framework');
const fetchMember = require('../../util/fetch/member');
const permCheck = require('../../util/client/check_perm');
const error = require('../../util/client/error/stack');

const { Guild } = require('./../../data/Models');

module.exports = class Options extends Command {
    constructor() {
        super({
            alias: ['settings'],
            name: 'options',
            usage: 'options welcome\noptions levelUp\noptions prefix <newPrefix>',
            permLevel: 2,
            exp: 0,
            coins: 0,
            enabled: true
        });
    }

    async run(message, color, args) {
        let g;
        try {
            g = await Guild.get(message.guild.id).run();
        } catch (err) {
            g = new Guild({
                id: message.guild.id
            });
        }

        let option = args[0].toLowerCase();

        if (option === 'welcome') {
            g.notifications.welcome = !g.notifications.welcome;
            message.channel.send(`Welcome notifications are now ${g.notifications.welcome ? 'enabled' : 'disabled'}.`);
        } else if (option === 'levelup') {
            g.notifications.levelUp = !g.notifications.levelUp;
            message.channel.send(`Level up notifications are now ${g.notifications.levelUp ? 'enabled' : 'disabled'}.`);
        } else if (option === 'prefix') {
            let newPrefix = args.slice(1).join(' ');
            if (newPrefix.length === 0) {
                message.channel.send(`My local prefix on this guild is \`${g.prefix}\``);
            } else {
                g.prefix = newPrefix;
                message.channel.send(`Local prefix set: \`${g.prefix}\``);
            }
        } else {
          message.channel.send('Invalid argument! See `help options`')
        }
        g.save();
    }
}
