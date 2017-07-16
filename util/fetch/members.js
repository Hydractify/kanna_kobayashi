const log = require('../log/error');

module.exports = async (message) =>
{
    if (!message)
    {   throw new Error('fetchMembers takes one parameter: Message');   }
    else 
    {   if (typeof message !== 'object') throw new Error('Message must be an Object');  }

    let fetch = await message.guild.fetchMembers()
    .catch(e => 
    {   return log(e);   });

    return fetch;   }