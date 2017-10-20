const Command = require('../../structures/Command');
const RichEmbed = require('../../structures/RichEmbed');

class AvatarCommand extends Command {
	constructor(handler) {
		super(handler, {
			aliases: ['av'],
			clientPermissions: ['EMBED_LINKS'],
			coins: 0,
			description: 'Display the avatar of a user',
			examples: ['avatar @space#0302'],
			exp: 0,
			name: 'avatar',
			usage: 'avatar [User]'
		});
	}

	async run(message, [input], { authorModel }) {
		const user = input
			? await this.handler.resolveMember(message.guild, input)
				.then(member => member
					? member.user
					: this.handler.resolveUser(input)
				)
			: message.author;
		if (!user) return message.reply(`I could not find a user with ${input}.`);

		const embed = RichEmbed.common(message, authorModel)
			.setAuthor(`${user.tag}'s avatar`, user.displayAvatarURL, user.displayAvatarURL)
			.setImage(user.displayAvatarURL);

		return message.channel.send(embed);
	}
}

module.exports = AvatarCommand;
