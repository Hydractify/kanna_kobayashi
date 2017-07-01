const Discord = require('discord.js');
const client = new Discord.Client();
const settings = require('./util/settings');
const { bot } = require('./util/log');
const r = require('rethinkdb');

require('./engine/events')(client);
require('./engine/readdir')(client);
require('./engine/clientSpecifics')(client);
require('./engine/postGuildCount')(client);
require('./engine/Database').start();

bot('Logging in...');

process.on('unhandledRejection', console.error);

client.login(settings.beta_client.token);
