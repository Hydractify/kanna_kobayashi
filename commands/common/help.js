const Command = require('../../cogs/commands/framework');
const Discord = require('discord.js');

class HelpUtil {
  constructor(message, args, color) {
    if (!Array.isArray(args)) throw new Error('Args must be an array!');
    this.client = message.client;
    if (typeof this.client !== 'object') throw new Error('this.client must be an object!');
    if (typeof color !== 'string') throw new Error('Color must be a String!');
    this.message = message;
    this.args = args;
    this.color = color;
  }

  categoryMap(category, name) {
    if (typeof category !== 'string' || typeof name !== 'string') throw new Error('Category and Name must be a String!');

    const embed = new Discord.RichEmbed()
    .setFooter(`Requested by ${this.message.author.tag}`, this.message.author.displayAvatarURL)
    .setThumbnail(this.client.user.displayAvatarURL)
    .setURL('http://kannathebot.me/guild')
    .setAuthor(`${this.client.user.username} ${name} Commands`, this.client.user.displayAvatarURL)
    .setTimestamp()
    .setDescription('\u200b')
    .setColor(this.color)

    this.client.commands.filter(c=>c.category === category).forEach(c => embed.addField('kanna ' + c.name, c.description));

    return embed;
  }

  findCmd(color) {
    let command = this.client.commands.get(this.args[0]) || this.client.commands.get(this.client.aliases.get(this.args[0]))
    if (command) {
      let example = Array.isArray(command.example) ? 'kanna ' + command.example.join('\nkanna ') : command.example;

      const embed = new Discord.RichEmbed()
      .setAuthor(`${command.name.toUpperCase()} Info`, this.client.user.displayAvatarURL)
      .setDescription('\u200b')
      .setFooter(`Requested by ${this.message.author.tag}`, this.message.author.displayAvatarURL)
      .setURL('http://kannathebot.me/guild')
      .setThumbnail(this.client.user.displayAvatarURL)
      .setTimestamp()
      .addField('Usage', 'kanna ' + command.usage)
      .addField('Example', example)
      .addField('Aliases', 'kanna ' + command.alias.join('\nkanna pls '))
      .addField('Description', command.description)
      .addField('Permission Level', command.permLevel)
      .addField('Enabled', command.enabled ? 'Yes':'No')
      .setColor(color);

      return this.message.channel.send({embed})
    } else {
      return this.message.channel.send(`Couldn't find any command with the name **${this.args[0]}**`);
    }
  }
}

const Util = HelpUtil;

module.exports = class Help extends Command {
  constructor() {
    super({
      alias: ['halp'],
      description: 'Display all available commands',
      usage: 'help <command>',
      example: ['help', 'help ping'],
      name: 'help',
      exp: 0,
      coins: 0,
      enabled: true
    });
  }

  async run(message, color, args, perms) {
    if (!message.guild.me.permissions.has('EMBED_LINKS')) {
      await message.channel.send(`${message.author} i don't have permission to send embed links!`);
      return;
    }

    if (!message.guild.me.permissions.has('ADD_REACTIONS')) {
      await message.channel.send(`${message.author} i don't have permission to add reactions!`);
      return;
    }

    let util = new Util(message, args, color);

    if(!args[0]) {
      const embeds = {
        ['1']: util.categoryMap('common', 'Common'),
        ['2']: util.categoryMap('int', 'Interactive'),
        ['3']: util.categoryMap('gen1', 'Memes Generation 1'),
        ['4']: util.categoryMap('gen2', 'Memes Generation 2'),
        ['5']: util.categoryMap('gen3', 'Memes Generation 3'),
        ['6']: util.categoryMap('gen4', 'Memes Generation 4'),
        ['7']: util.categoryMap('weeb', 'Weeaboo'),
        ['8']: util.categoryMap('mod', 'Moderation'),
        ['9']: util.categoryMap('unique', 'Unique')
      }

      let msg = await message.channel.send({embed : embeds['1']});

      let emojis = ['⬅', '➡', '❎'];

      for (let emo of emojis) {
        await msg.react(emo);
      }

      let number = 1;

      const selectEmbed = (choose) => {
        choose === '➡' ? number++ : number--;
        if (number > 9) number = 1;
        if (number <= 0) number = 9;
        if (number == 7 && perms < 1) number = 1;
        if (number == 8 && perms < 2) number = 2;
        if (number == 9 && perms < 3) number = 3;
        return embeds[number.toString()];
      }

      let filter = (r, u) => {
        return emojis.includes(r.emoji.name) && u.id === message.author.id;
      }

      let collector = msg.createReactionCollector(filter, {time : 300000});
      collector.on('collect', async(c) => {
        if(c.emoji.name === '➡') {
          await msg.edit({embed : selectEmbed('➡')});
          await c.remove(message.author);
        }
        if(c.emoji.name === '⬅') {
          await msg.edit({embed : selectEmbed('⬅')});
          await c.remove(message.author);
        }
        if(c.emoji.name === '❎') {
          await message.delete();
          await msg.delete();
          collector.stop();
        }
      });
    } else {
        util.findCmd(color);
    }
  }
}
