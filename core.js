const Discord = require('discord.js');
const client = new Discord.Client();
const settings = require('./util/settings.js');
const { bot } = require('./util/log.js');
const r = require('rethinkdb');

require('./engine/events.js')(client);
require('./engine/readdir.js')(client);
require('./engine/clientSpecifics.js')(client);
require('./engine/postGuildCount.js')(client);
require('./util/connectDb.js').start();

bot('Logging in...');

process.on('unhandledRejection', console.error);

client.login(settings.beta_client.token);
