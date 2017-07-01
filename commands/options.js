const Discord = require('discord.js');
const Command = require('../engine/commandClass');
const Database = require('../engine/db/tables');

module.exports = class Profile extends Command
{
  constructor(client)
  {
    super(client,
    {
      alias: ['opts'],
      name: 'options',
      usage: 'options <argument>',
      category: '',
      description: 'Change the options for your guild!',
      permLevel: 2
    });
  }

  async run(client, message, pinku, args)
  {
    
  }
}
