module.exports = (user, message) =>
{
    if(!user || !message) // Check if the parameters exist
    {   throw new Error('Fetch error takes two parameters, User and Message');  }
    else
    {   if(typeof message !== 'object') throw new Error('Message must be an Object');
        if(typeof user !== 'string') throw new Error('User must be a String');  }
                // Check if parameters are valid
    
    message.channel.send(`I couldn't find anything matching **${user}** <:ayy:315270615844126720>`);    } // Pretty obvious am i rite