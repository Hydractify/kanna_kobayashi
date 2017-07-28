const Discord = require('discord.js');
const Command = require('../../cogs/commands/framework');
const fetchMember = require('../../util/fetch/member');
const permCheck = require('../../util/client/check_perm');
const error = require('../../util/client/error/stack');

const { User } = require('../../data/Models');

module.exports = class Profile extends Command {
    constructor() {
        super({
            alias: ['pf'],
            name: 'profile',
            enabled: true
        });
    }

    async run(message, color, args) {
        let member;

        try {
            member = await fetchMember(message, args);
        } catch (err) {
            member = message.member;
        }

        if (member.user.bot)
            return message.channel.send(`Bots don't have profiles!`);

        let user;

        try {
            user = await User.get(member.id).run();
        } catch (err) {
            user = new User({ id: member.id });
            user.save();
        }

        const embed = new Discord.RichEmbed()
            .setColor(color)
            .setFooter(`Requested by ${message.author.tag}`, message.author.displayAvatarURL)
            .setAuthor(`${member.displayName} Profile (${member.id})`, member.user.displayAvatarURL)
            .setDescription('\u200b')
            .setThumbnail(member.user.displayAvatarURL)
            .addField('Level', user.getLevel() + ' (' + user.exp + ' xp)', true)
            .addField('Kanna Coins', user.coins + ' <:coin:330926092703498240>', true)
        /*.addField('Items', user.items, true)
        .addField('Badges', user.badges, true)*/;

        message.channel.send({embed});
    }
};
