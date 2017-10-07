const Command = require('../../structures/Command');
const RichEmbed = require('../../structures/RichEmbed');

class InfoCommand extends Command {
	constructor(handler) {
		super(handler, {
			aliases: ['invite', 'patreon', 'guild', 'ghearts'],
			clientPermissions: ['EMBED_LINKS'],
			coins: 0,
			description: 'All the useful links you need!',
			examples: ['info'],
			exp: 0,
			name: 'info',
			usage: 'info'
		});
	}

	run(message) {
		const embed = RichEmbed.common(message)
			.setAuthor(`${this.client.user.username} Info`, this.client.user.displayAvatarURL)
			.setDescription('\u200b')
			.addField('Invite', 'http://kannathebot.me/invite', true)
			.addField('Patreon', 'http://kannathebot.me/patreon', true)
			.addField('Official Guild', 'https://discord.gg/uBdXdE9', true)
			.addField('Official Website', 'http://kannathebot.me', true)
			.setThumbnail(message.guild.iconURL);

		return message.channel.send(embed);
	}
}

module.exports = InfoCommand;
