const Command = require('../engine/commandClass');
const get = require('../util/get');
const embeds = require('../util/embeds');

module.exports = class Quote extends Command
{
  constructor(client)
  {
    super(client,
    {
      alias: ['message'],
      name: 'quote',
      exp: 0,
      coins: 0,
      usage: 'quote <messageID>',
      enabled: true
    });
  }

  async run(client, message, color, args)
  {
    if(!args[0] || !parseInt(args[0])) return message.channel.send(`${message.author} you are not using the command correctly! This is how you use it: \`kanna pls ${this.usage}\``);

    let msg = await get.message(args[0], message);

    if(!msg) return;

    const embed = embeds.common(color, message)
    .setAuthor(`${msg.member.displayName} message`, msg.author.displayAvatarURL)
    .setDescription(`On ${msg.channel.toString()} by ${msg.author}`)
    .setThumbnail(message.guild.iconURL);

    if(msg.content)
    {
      embed.addField('Content', msg.content);
    }
    if(msg.attachments.first())
    {
      embed.setImage(msg.attachments.first().url);
    }
    if(msg.embeds.image)
    {
      embed.setImage(msg.embeds.image.url);
    }
    if(msg.reactions.size)
    {
      //console.log(msg.reactions.emoji.name);
      embed.addField('Reactions', msg.reactions.map(r => r.emoji.toString()).join(' '));
    }
    if(!msg.reactions.size && !msg.embeds.image && !msg.attachments.first() && !msg.content)
    {
      embed.addField('There\'s nothing to show...', `_sorry ${message.author}_`);
    }

    await message.channel.send({embed});
  }
}
