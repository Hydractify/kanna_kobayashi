const { Guild, GuildMember, User, RichEmbed } = require('discord.js');
const Raven = require('raven');

require('./extensions/String');
const GuildExtension = require('./extensions/Guild');
const GuildMemberExtension = require('./extensions/GuildMember');
const UserExtension = require('./extensions/User');
const RichEmbedExtension = require('./extensions/RichEmbed');
const Client = require('./structures/Client');
const Database = require('./structures/PostgreSQL');
const Logger = require('./structures/Logger');

process.on('unhandledRejection', Logger.instance.error.bind(Logger.instance, '[REJECTION]:'));
Raven.config('https://27e26b64bed14c6a84bd91f35a52d914:6f98cea9e01a4eba86cfe139ed97e8aa@sentry.io/196287').install();

Database.instance.start();

GuildExtension.extend(Guild);
GuildMemberExtension.extend(GuildMember);
UserExtension.extend(User);
RichEmbedExtension.extend(RichEmbed);

const client = new Client({ disableEveryone: true });

client.login();
