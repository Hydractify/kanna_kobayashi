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
        let guild;
        try {
            guild = await Guild.get(message.guild.id).run();
        } catch (err) {
            guild = new Guild({ id: message.guild.id });
        }

        if (args.length === 0) {
            const embed = require('../../util/embeds/common')(color, message)
                .setAuthor(`${message.guild.name} Options`, message.guild.iconURL)
                .setDescription('\u200b')
                .setThumbnail(message.guild.iconURL)
                .addField('Prefix', guild.prefix, true)
                .addField('Mod Role', guild.roles.mod, true)
                .addField('Level Up Messages', guild.notifications.levelUp ? 'Enabled' : 'Disabled', true)
                .addField('Welcome Messages', guild.notifications.welcome ? 'Enabled' : 'Disabled', true);
            return message.channel.send({ embed });
        }

        let option = args[0].toLowerCase();
        if (option === 'welcome') {
            guild.notifications.welcome = !guild.notifications.welcome;
            message.channel.send(`Welcome notifications are now ${guild.notifications.welcome ? 'enabled' : 'disabled'}.`);
        } else if (option === 'levelup') {
            guild.notifications.levelUp = !guild.notifications.levelUp;
            message.channel.send(`Level up notifications are now ${guild.notifications.levelUp ? 'enabled' : 'disabled'}.`);
        } else if (option === 'prefix') {
            let newPrefix = args.slice(1).join(' ');
            if (newPrefix.length === 0) {
                message.channel.send(`My local prefix on this guild is \`${guild.prefix}\``);
            } else {
                guild.prefix = newPrefix;
                message.channel.send(`Local prefix set: \`${guild.prefix}\``);
            }
        } else {
            message.channel.send(`Hey ${message.author}!

You've input an option that doesn't exist! The available options are

\`levelup\` | \`welcome\` | \`prefix\``);
        }
        guild.save();
    }
}
