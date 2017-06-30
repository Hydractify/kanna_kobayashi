const eventFile = (event) => require(`./client_events/${event}`);
const { load } = require('../util/log.js');

module.exports = (client, guild) => {
	client.on('ready', () => eventFile('ready')(client));
	//client.on('reconnecting', () => eventFile('reconnecting')(client));
	//client.on('disconnect', () => eventFile('disconnect')(client));
	client.on('message', eventFile('message'));
	//client.on('guildCreate', guild => eventFile('guildCreate')(client, guild));
	//client.on('guildDelete', guild => eventFile('guildDelete')(client, guild));
	//client.on('guildMemberAdd', member => eventFile('guildMemberAdd')(client, member));
	//client.on('guildMemberRemove', member => eventFile('guildMemberRemove')(client, member));
	load('Loaded Client Events');
};
