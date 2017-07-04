const Discord = require('discord.js');
const Command = require('../engine/commandClass');
const get = require('../util/get');

module.exports = class Avatar extends Command
{
  constructor(client)
  {
    super(client, {
      name: 'avatar',
      alias: ['av'],
      category: 'common',
      example: 'avatar @Wizardλ#5679',
      exp: 0,
      coins: 0 
    });
  }

  async run(client, message, color, args)
  {
    let user = message.author
    if(args[0] || message.mentions.size >= 1)
    {
      let fetch = await get.user(client, message, args);
      if(fetch !== undefined)
      {
        user = fetch;
      }
    }

    const embed = new Discord.RichEmbed()
    .setImage(user.displayAvatarURL)
    .setColor(color)
    .setFooter(`Requested by ${message.author.tag}`)
    .setAuthor(`${user.tag} Avatar (${user.id})`, user.displayAvatarURL)
    .setURL(user.displayAvatarURL);

    await message.channel.send({embed});
  }
}
