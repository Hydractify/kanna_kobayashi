const Discord = require('discord.js');
const Command = require('../../cogs/commands/framework');
const fs = require('fs');
const log = require('../../util/log/error');
const { client } = require('../../cogs/connections/discord');
const blackFile = require('../../data/client/blacklist');

module.exports = class Blacklist extends Command
{ constructor()
  { super(
    { name: 'blacklist',
      permLevel: 3,
      alias: ['exile'],
      usage: 'blacklist <key> <value>',
      example: ['blacklist id 279018121099214848', 'blacklist name TESTING'],
      enabled: true	});	}

  async run(message, color, args)
  {	let bk = JSON.parse(fs.readFileSync('./data/client/blacklist.json', 'utf8'));

    if (args[0] === 'id')
    { if (!args[1]) return message.channel.send(`${message.author} you must provide an ID!\n\n**Example**: \`${this.example[0]}\``);

      if (!client.guilds.get(args[1])) return message.channel.send(`Couldn't find **${args[1]}**!`)
	  if (blackFile.includes(args[1])) return message.channel.send(`**${client.guilds.get(args[1]).name}** is already blacklisted!`);

      await message.channel.send(`The guild name is **${client.guilds.get(args[1]).name}** and the owner is **${client.guilds.get(args[1]).owner.user.tag}** is it right?`);

      var collected = await message.channel.awaitMessages(response => response.author === message.author && (response.content.toLowerCase() === 'yes' || response.content.toLowerCase() === 'no'), { max: 1 });

      if (collected.first().content.toLowerCase() === 'yes')
      {	await bk.push(args[1]);
        await fs.writeFile('./data/client/blacklist.json', JSON.stringify(bk), 'utf8', (err) =>
	  {	if (err) log(err);	});
	  
      await message.channel.send(`**${client.guilds.get(args[1]).name}** is getting blacklisted!`);

      const embed = new Discord.RichEmbed()
      .setColor(color)
      .setTimestamp()
      .setAuthor(`Blacklisted by ${message.author.tag}`, message.author.displayAvatarURL)
      .addField('ID', args[1], true)
	  .addField('Name', client.guilds.get(args[1]).name, true)
	  .addField('Owner', client.guilds.get(args[1]).owner.user.tag, true)
	  .addField('Owner ID', client.guilds.get(args[1]).owner.user.id, true)
      .setDescription('\u200b')
      .setThumbnail(client.guilds.get(args[1]).iconURL);

      await client.guilds.get('298969150133370880').channels.get('302286657271496705').send({embed});	};

	  if (collected.first().content.toLowerCase() === 'no') 
	  {	await message.channel.send('Ok, cancelling blacklist.');	};	}

    else if (args[0] === 'name')
    { if (!args[1]) return message.channel.send(`${message.author} you must provide a name!\n\n**Example:** \`${this.example[1]}\``);
      if (!client.guilds.find('name', args.slice(1).join(' '))) return message.channel.send(`Couldn't find **${args.slice(1).join(' ')}**!`);
	  if (blackFile.includes(client.guilds.find('name', args.slice(1).join(' ')).id)) return message.channel.send(`**${args[1]}** is already blacklisted!`);	

      await message.channel.send(`The guild name is **${args.slice(1).join(' ')}** and the owner is **${client.guilds.find('name', args.slice(1).join(' ')).owner.user.tag}** is it right?`);

      var collected = await message.channel.awaitMessages(response => response.author === message.author && (response.content.toLowerCase() === 'yes' || response.content.toLowerCase() === 'no'), { max: 1 });

          if (collected.first().content.toLowerCase() === 'yes')
          {	await bk.push(client.guilds.find('name', args.splice(1).join(' ')).id);
            await fs.writeFile('./data/client/blacklist.json', JSON.stringify(bk), 'utf8', (err) =>
		  {	if(err) log(err);	});
		  
          await message.channel.send(`**${args[1]}** is getting blacklisted!`);

          const embed = new Discord.RichEmbed()
          .setColor(color)
          .setTimestamp()
          .setAuthor(`Blacklisted by ${message.author.tag}`, message.author.displayAvatarURL)
          .addField('ID', client.guilds.find('name', args.slice(1).join(' ')).id, true)
          .addField('Name', args.slice(1).join(' '), true)
          .setDescription('\u200b')
          .setThumbnail(client.guilds.find('name', args.slice(1).join(' ')).iconURL);

		  await client.guilds.get('298969150133370880').channels.get('302286657271496705').send({embed});	}
		  
          if (collected.first().content.toLowerCase() === 'no')
		  {	await message.channel.send('Ok, cancelling blacklist.');	}	}
		  
    else if (!args[0] || args[1] !== 'id' && args[1] !== 'name')
    {	await message.channel.send(`Hey ${message.author}! That's not how you use it!\n\n**Usage**: \`${this.usage}\``);	}
    else
    {	await message.channel.send('Something went wrong!');	}	}	}
