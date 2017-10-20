const { ravenToken } = require('./data');
const Raven = require('raven');

const { extendAll } = require('./extensions/Extension');
const Client = require('./structures/Client');
const Logger = require('./structures/Logger');
const Database = require('./structures/PostgreSQL');
const Redis = require('./structures/Redis');

process.on('unhandledRejection', Logger.instance.error.bind(Logger.instance, '[REJECTION]:'));
Raven.config(ravenToken).install();
extendAll();

Database.instance.start();
Redis.instance.start();

const client = new Client({ disableEveryone: true });

client.login();
