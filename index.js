const { Emoji, Guild, GuildMember, ShardClientUtil, User } = require('discord.js');
const Data = require('./data');
const Raven = require('raven');

const EmojiExtension = require('./extensions/Emoji');
const GuildExtension = require('./extensions/Guild');
const GuildMemberExtension = require('./extensions/GuildMember');
const ShardClientUtilExtension = require('./extensions/ShardClientUtil');
const UserExtension = require('./extensions/User');
const Client = require('./structures/Client');
const Logger = require('./structures/Logger');
const Database = require('./structures/PostgreSQL');
const Redis = require('./structures/Redis');

process.on('unhandledRejection', Logger.instance.error.bind(Logger.instance, '[REJECTION]:'));
Raven.config(Data.ravenToken).install();

EmojiExtension.extend(Emoji);
GuildExtension.extend(Guild);
GuildMemberExtension.extend(GuildMember);
ShardClientUtilExtension.extend(ShardClientUtil);
UserExtension.extend(User);

Database.instance.start();
Redis.instance.start();

const client = new Client({ disableEveryone: true });

client.login(Data.clientToken);
