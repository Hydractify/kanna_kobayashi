const Discord = require('discord.js');
const Command = require('../engine/commandClass');
const Database = require('../engine/Database');
const Guild = require('../engine/Guild');
const table = require('../engine/db/tables');

module.exports = class Options extends Command
{
  constructor(client)
  {
    super(client,
    {
      alias: ['opt'],
      name: 'options',
      usage: 'options <option> <value>',
      category: 'mod',
      description: 'Change the options for your guild!',
      permLevel: 2
    });
  }

  async run(client, message, pinku, args)
  {
    if (args.length !== 2) return message.channel.send(`Proper usage of command: \`${this.usage}\``);
    const options = ["list", "prefix" , "disableLeveling" , "modrole"];
    if (!options.includes(args[0])) return message.channel.send(`Option \`${args[0]}\` doesn't exist, avaliable options are ${options.slice(1).join("-")} \n If you want to list the current options for your guild, do \`k!options list\``);
    let option = args[0];

    if (option === "list") {
      let stats = await Guild.stats(message.guild);
      const embed = new Discord.RichEmbed()
      .setAuthor(message.guild.name)
      .addField("Prefix" , stats.prefix || "k!", true)
      .addField("Modrole" , stats.modrole || 'Dragon Tamer', true)
      .addField("DisableLeveling" , stats.disableLeveling || "Enabled")
      .setFooter(`Requested by ${message.author.tag}`, message.author.displayAvatarURL)
      .setTimestamp();
      await message.channel.send({embed});
    }

    let argument = args[1];
    await Guild.modify(option, argument, message.guild);
    await message.channel.send(`Successfully changed option \`${args[0]}\` to \`${args[1]}\``)
  }
}
