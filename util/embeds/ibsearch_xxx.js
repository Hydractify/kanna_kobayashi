const Discord = require('discord.js');
const ibsearch_xxx = require('../../cogs/connections/apis/ibsearch_xxx');
const { client } = require('../../cogs/connections/discord');

module.exports = async (color, message, args) => {
    let image;

    if (args.length) {
        const search = encodeURIComponent(args.join(' ')).replace(/%20/g, '+');
        image = await ibsearch_xxx(search);
    } else {
        image = await ibsearch_xxx('random%3A');
    }

    if (!image || !image.length) return null;

    image = image[Math.floor(Math.random() * image.length)];

    return new Discord.RichEmbed()
        .setColor(color)
        .setFooter(`Requested by ${message.author.tag} | Powered by ibsearch.xxx`, message.author.displayAvatarURL)
        .setImage(`https://${image.server}.ibsearch.xxx/${image.path}`)
        .setAuthor(`IbSearch NSFW Result (Explicit)`, client.user.displayAvatarURL)
        .setDescription(`${image.tags.split(' ').slice(0, 10).join(', ')}...`)
        .setURL(`https://${image.server}.ibsearch.xxx/${image.path}`);
};
