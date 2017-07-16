const log = require('../client/error/fetch');

module.exports = async (client, message, args) =>
{
    if (!client || !message || !args) // Check if all 3 parameters were put
    {   throw new Error('fetchMember takes 3 parameters: Client, Message and Arguments');   }
    else 
    {   if (typeof client !== 'object') throw new Error('Client must be an Object');
        if (typeof message !== 'object') throw new Error('Message must be an Object');
        if (!Array.isArray(args)    ) throw new Error('Arguments must be an Array');
        // Check if parameters are valid

        let fetch = args[0];

        if (message.mentions.size >= 1) // If the message have mentions
        {   fetch = message.mentions.users.first();    }
        else if (message.guild.members.find(m => m.user.tag.toLowerCase().includes(args[0].toLowerCase()    )   )   ) // If the message fits someone's tag (username + discriminator)
        {   fetch = message.guild.members.find(m => m.user.tag.toLowerCase().includes(args[0].toLowerCase() )   );  }
        else if (message.guild.members.find(m => m.displayName.toLowerCase().includes(args[0].toLowerCase() )   )   ) // If Username or Nickname is found
        {   fetch = message.guild.members.find(m => m.displayName.toLowerCase().includes(args[0].toLowerCase()  )   );   }

        fetch = message.guild.fetchMember(fetch)
        .catch(e =>
        {   throw log(fetch, message); }   );

        return fetch;   }   }