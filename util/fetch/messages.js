const log = require('../log/error');

module.exports = async (message) =>
{
    if (!message) // Check if all parameters have been passed
    {   throw new Error('fetchMessages takes 1 parameter: Message');    }
    else
    {   if (typeof message !== 'object') throw new Error('Message must be an Object');  } // Check if parameter is valid

    let fetch = await message.channel.fetchMessages()
    .catch(e => 
    {   return log(e);   }   );

    return fetch;   }