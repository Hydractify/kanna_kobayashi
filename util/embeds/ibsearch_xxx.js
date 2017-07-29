const Discord = require('discord.js');
const ibsearch_xxx = require('../../cogs/connections/apis/ibsearch_xxx');
const { client } = require('../../cogs/connections/discord');

module.exports = async (color, message, args) =>
{ let image;
  
  if (args[0])
  {
    if (args.length > 1)
    { image = await ibsearch_xxx(args[0]); }
    else
    { image = await ibsearch_xxx(args.join('+'));  } }
  else 
  { image = await ibsearch_xxx('random:'); }

  image = image.body[Math.floor(Math.random() * image.body.length)];

  return new Discord.RichEmbed()
  .setColor(color)
  .setFooter(`Requested by ${message.author.tag} | Powered by ibsearch.xxx`, message.author.displayAvatarURL)
  .setImage(`https://${image.server}.ibsearch.xxx/${image.path}`)
  .setAuthor(`IbSearch NSFW Result (Explicit)`, client.user.displayAvatarURL)
  .setDescription(image.tags.split(' ').slice(0, 10).join(', ') + '...')
  .setURL(`https://${image.server}.ibsearch.xxx/${image.path}`); }