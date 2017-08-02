const Discord = require('discord.js');
const ibsearch = require('../../cogs/connections/apis/ibsearch');
const { client } = require('../../cogs/connections/discord');

module.exports = async (color, message, args) => {
    let image;

    if (args.length) {
        const search = encodeURIComponent(args.join(' ')).replace(/%20/g, '+');
        image = await ibsearch(search);
    } else {
        image = await ibsearch('random%3A');
    }

    if (!image || !image.length) return null;

    image = image[Math.floor(Math.random() * image.length)];

    return new Discord.RichEmbed()
        .setColor(color)
        .setFooter(`Requested by ${message.author.tag} | Powered by ibsear.ch`, message.author.displayAvatarURL)
        .setImage(`https://${image.server}.ibsear.ch/${image.path}`)
        .setAuthor(`IbSearch SFW Result (Safe)`, client.user.displayAvatarURL)
        .setDescription(`${image.tags.split(' ').slice(0, 10).join(', ')}...`)
        .setURL(`https://${image.server}.ibsear.ch/${image.path}`);
};
