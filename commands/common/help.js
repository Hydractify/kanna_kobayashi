const Command = require('../../structures/Command');
const { RichEmbed } = require('discord.js');
const { readdir } = require('fs');
const { promisify } = require('util');
const readdirAsync = promisify(readdir);

class HelpUtility {
  /**
  * Makes life easier when
  */
  constructor(message, args) {
    this.message = message;
    this.client = message.client;
    this.args = args;
    this.userModel = this.message.author.fetchModel();
  }

  async mapCategory(category) {
    if (typeof category !== 'string') throw new TypeError('Category name must be a String!');
    const User = await this.userModel;

    const embed = RichEmbed.common(this.message)
    .setThumbnail(this.message.guild.iconURL)
    .setURL('http://kannathebot.me/guild')
    .setAuthor(`${this.client.user.username} ${category.toTitleCase()}`)
    .setColor(this.client.color(User));

    const commands = this.client.commands.filter(c => c.category === category);
    for (const command of commands.values()) {
      embed
      .addField(`kanna ${command.name}`, command.usage);
    }

    if (embed.fields.length === commands.size) { // Sanity check
      await this.message.channel.send(embed);
      return;
    }
  }

  async findCommand() {
    const command = this.client.commands.get(this.args[0]) || this.client.commands.get(this.client.aliases.get(this.args[0]));
    const User = await this.userModel;

    if (command) {
      const embed = RichEmbed.common(this.message)
      .setAuthor(`${command.name.toTitleCase()}'s Info`, this.client.user.displayAvatarURL)
      .setURL('http://kannathebot.me/guild')
      .setColor(this.client.color(User))
      .setThumbnail(this.message.guild.iconURL)
      .addField('Aliases', `kanna ${command.aliases.join('\nkanna ')}`)
      .addField('Usage', `kanna ${command.usage}`)
      .addField('Example(s)', `kanna ${command.example.join('\nkanna ')}`)
      .addField('Description', command.description)
      .addField('Permissions Level Required', command.permLevel)
      .addField('Enabled', command.enabled ? 'Yes' : 'No');

      await this.message.channel.send(embed);
      return
    } else {
      return this.message.channel.send(`Could not find any command matching **${this.args[0]}** <:KannaAyy:315270615844126720>`);
    }
  }
}

class HelpCommand extends Command {
  constructor(handler) {
    super(handler, {
      aliases : ['halp', 'commands'],
      coins : 0,
      exp : 0,
      cooldown : 10000,
      description : `See all the commands (or a specifc one) Kanna has!
      _PS: Use the arrow reactions to scroll through categories_`,
      name : 'help',
      permLevel : 0,
      examples : ['help ping', 'help'],
      usage : 'help <Command[Optional]>'
    });
  }

  async run(message, args) {
    if (!message.channel.permissionsFor(message.guild.me).has('EMBED_LINKS')) {
      await message.channel.send(`${message.author}! I do not have the permission to send **Embeds** (Embed Links Permission)! <:KannaWtf:320406412133924864>`);
      return;
    }

    if (!message.channel.permissionsFor(message.guild.me).has('ADD_REACTIONS')) {
      await message.channel.send(`${message.author}! I do not have the permission to **Add Reactions** (Add Reactions Permission)! <:KannaWtf:320406412133924864>`);
      return;
    }

    if (!message.channel.permissionsFor(message.guild.me).has('MANAGE_MESSAGES')) {
      await message.channel.send(`${message.author}! I do not have the permission to **Delete Messages** (Manage Messages Permission)! <:KannaWtf:320406412133924864>`);
      return;
    }

    const Util = new HelpUtility(message, args);

    if (!args[0]) {
      const folders = await readdirAsync('./commands');
      const embeds = [];
      console.log(folders);

      for (const folder of folders) {
        embeds.push(Util.mapCategory(folder));
      }

      const HelpMessage = await message.channel.send({embeds : embeds[1]});

      const emojis = ['⬅', '➡', '❎'];

      for (const emoji of emojis) {
        await HelpMessage.react(emoji);
      }

      let number = 0;

      const selectEmbed = (choose) => {
        choose === '➡' ? number++ : number--;
        if (number > folders.size) number = 0;
        if (number <= 0) number = folders.size;
        return embeds[number];
      }

      const filter = (reaction, user) => emojis.includes(reaction.emoji.name) && user.id === message.author.id;

      const ReactionCollector = HelpMessage.createReactionCollector(filter, { time : 300000 });
      ReactionCollector.on('collect', async(reaction) => {
        if (reaction.emoji.name === '➡') {
          await HelpMessage.edit({ embed : selectEmbed('➡') });
          await reaction.remove(message.author);
        }
        if (reaction.emoji.name === '⬅') {
          await HelpMessage.edit({ embed : selectEmbed('⬅') });
          await reaction.remove(message.author);
        }
        if (reaction.emoji.name === '❎') {
          await message.delete();
          await HelpMessage.delete();
          ReactionCollector.stop();
        }
      });
    } else {
      Util.findCommand();
    }
  }
}

module.exports = HelpCommand;
