const Command = require('../engine/commandClass');
const Guild = require('../engine/Guild');

module.exports = class Quiz extends Command
{
  constructor(client)
  {
    super(client,
    {
      alias: ['qinfo'],
      name: 'quiz',
      category: 'quiz',
      usage: 'quiz <option> <value>'
      exp: 0,
      coins: 0,
      cooldown: 30000,
      permLevel: 1
    })
  }

  async run(client, message, color, args)
  {
    if(args[0])
    {
      let key = args[0];
      let value = args[1];

      let keys = require('../util/settings').table.guilds.quizOptions;

      if(!keys.includes(key.toLowerCase())) return message.channel.send(`Hey ${message.author}! \n\nYou've input an option that doesn't exist! The available options are\n\n\`${options.join('` | `')}\``);

      if(!value) return message.channel.send(`${message.author} the option **${key}** must have a value!\n\nUsage:\n\`${this.usage}\``);

      if(key === keys[0])
      {
        await Guild.modify(message.guild,
        {
          firstName: value,
          lastName: args.slice(2).join(' ')
        });

        let stats = await Guild.stats(message.guild);

        await message.channel.send(`Modified Quiz Character Name to: **${stats.firstName + ' ' + stats.lastName}**`);
      }
      if(key === keys[1])
      {
        await Guild.modify(message.guild,
        {
          quizPhoto: value
        });

        let stats = await Guild.stats(message.guild);

        await message.channel.send(`Modified Quiz Character Photo to: **${stats.quizPhoto}**`);
      }
    }
    else
    {
      let stats = await Guild.stats(message.guild);

      const embed = require('../util/embeds').common(color, message)
      .setAuthor(`${message.guild.name} Quiz Info`, message.guild.iconURL)
      .setDescription('\u200b')
      .addField('Character Name', stats.firstName + ' ' + stats.lastName)
      .addField('Character Photo', '\u200b')
      .setImage(stats.quizPhoto)
      .setThumbnail(message.guild.iconURL);

      await message.channel.send({embed});
    }
  }
}
