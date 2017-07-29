const Discord = require('discord.js');
const ibsearch = require('../../cogs/connections/apis/ibsearch');
const { client } = require('../../cogs/connections/discord');

module.exports = async (color, message, args) =>
{ let image;
  
  if (args[0])
  {
    if (!args[1])
    { image = await ibsearch(args[0]);  }
    else
    { image = await ibsearch(args.join('+'));
      console.log(args.join('+')); } }
  else 
  { image = await ibsearch('random:'); }

  image = image.body[Math.floor(Math.random() * image.body.length)];

  return new Discord.RichEmbed()
  .setColor(color)
  .setFooter(`Requested by ${message.author.tag} | Powered by ibsear.ch`, message.author.displayAvatarURL)
  .setImage(`https://${image.server}.ibsear.ch/${image.path}`)
  .setAuthor(`IbSearch SFW Result (Safe)`, client.user.displayAvatarURL)
  .setDescription(image.tags.split(' ').slice(0, 10).join(', ') + '...')
  .setURL(`https://${image.server}.ibsear.ch/${image.path}`); }