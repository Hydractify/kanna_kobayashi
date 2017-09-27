const { Guild, GuildMember } = require('discord.js');

const GuildExtension = require('./extensions/Guild');
const GuildMemberExtension = require('./extensions/GuildMember');
const Client = require('./structures/Client');

GuildExtension.extend(Guild);
GuildMemberExtension.extend(GuildMember);

const client = new Client({ disableEveryone: true });
