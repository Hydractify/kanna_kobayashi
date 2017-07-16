const Discord = require('discord.js');

module.exports = async (client, message, args) => 
{
    if (!client || !message || !args) //Check if parameters were passed
    {   throw new Error('fetchUser takes 3 parameters: Client, Message and Arguments'); }
    else
    {   if (client instanceof Discord.Client()    ) throw new Error('Client isn\'t an instance of Discord.Client()');
        if (typeof message !== 'object') throw new Error('Message must be an Object');
        if (!Array.isArray(args)    ) throw new Error('Arguments must be an Array'); }
        // Check if parameters are valid

    let fetch = args[0];

    if (message.mentions.users.size >= 1)
    {   resolvable = message.mentions.users.first().id; }
    else if (message.guild.members.find(m => m.user.tag.toLowerCase().includes(args[0].toLowerCase()    )   )   )
    {   resolvable = message.guild.members.find(m => m.user.tag.toLowerCase().includes(args[0].toLowerCase()    )   ).user.id; }
    else if (message.guild.members.find(m => m.displayName.toLowerCase().includes(args[0].toLowerCase() )   )   )
    {   resolvable = message.guild.members.find(m => m.displayName.toLowerCase().includes(args[0].toLowerCase() )   ).user.id;  }
    
    fetch = client.fetchUser(fetch)
    .catch(e =>
    {   sendErr(resolvable, message);   }   );

    return fetch;   }