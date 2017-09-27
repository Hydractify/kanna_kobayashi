const { Guild, GuildMember } = require('discord.js');
const Raven = require('raven');

const GuildExtension = require('./extensions/Guild');
const GuildMemberExtension = require('./extensions/GuildMember');
const Client = require('./structures/Client');

Raven.config('https://27e26b64bed14c6a84bd91f35a52d914:6f98cea9e01a4eba86cfe139ed97e8aa@sentry.io/196287').install();

GuildExtension.extend(Guild);
GuildMemberExtension.extend(GuildMember);

const client = new Client({ disableEveryone: true });
