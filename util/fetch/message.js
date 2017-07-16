const log = require('../client/error/fetch');

module.exports = async (id, message) => 
{
    if (!id || !message) // Check if parameters exist
    {   throw new Error('fetchMessage takes 2 paremeters: ID and Message')  }
    else 
    {   if (typeof id !== 'string') throw new Error('ID must be a String');
        if (typeof message !== 'object') throw new Error('Message must be an Object');  }
        // Check if parameters are valid

    let fetch = await message.channel.fetchMessage(id)
    .catch(e => 
    {   return log(id, message);    }   );

    return fetch;   }