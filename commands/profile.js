const Discord = require('discord.js');
const Command = require('../engine/commandClass.js');
const r = require('rethinkdb');
const Database = require('../util/Database');

module.exports = class Profile extends Command {
  constructor(client) {
    super(client, {
      alias: ['pf'],
      name: 'profile',
      usage: 'profile <user>',
      category: '',
      description: 'Look your own profile or of your friends!'
    })
  }

  async run(client, message, pinku, args) {
    const result = await r.db('users').table('stats').insert([
      {
        id: message.author.id,
        level: 0,
        exp: 0,
        coins: 100,
        items: [],
        badges: []
      }
    ]);
    console.log(JSON.stringify(result, null, 2));
    message.channel.send('wew');
  }
}
