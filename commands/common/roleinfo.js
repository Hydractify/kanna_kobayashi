const Command = require('../../structures/Command');
const RichEmbed = require('../../structures/RichEmbed');

class RoleInfoCommand extends Command {
	constructor(handler) {
		super(handler, {
			clientPermissions: ['EMBED_LINKS'],
			coins: 0,
			description: [
				'Displays information about the provided role',
				'Avoid role mentions as this will notify all members of the role.'
			].join('\n'),
			examples: ['roleinfo admin'],
			exp: 0,
			name: 'roleinfo',
			usage: 'roleinfo',
			permLevel: 0
		});
	}

	run(message, [roleName]) {
		if (!roleName) return message.channel.send('You need to give me a role name to search for.');

		// TODO: Make resolveRole method XD
		const role = this.handler.resolveRole(message.guild.roles, roleName, false);

		const embed = RichEmbed.common(message)
			.setAuthor(`Information about ${role.name}`)
			.setThumbnail(message.guild.iconURL)
			.addField('Color hex', role.color ? role.hexColor : 'No Color', true)
			.addField('Displayed seperately?', `**(Hoisting)**\n${role.hoisted ? 'Yes' : 'No'}`, true)
			.addField('Mentionable?', role.mentionable ? 'Yes' : 'No', true)
			.addField('Role member count', role.members.size, true);
		// Maybe add something like special permissions?

		// Twitch subscriber role or something, false for like 99% of roles
		if (role.managed) embed.addField('Is the role managed by an external application?', 'Yes', true);

		return message.channel.send(embed);
	}
}

module.exports = RoleInfoCommand;
