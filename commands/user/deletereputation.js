const Command = require('../../structures/Command');
const UserReputation = require('../../models/UserReputation');

class DeleteReputationCommand extends Command {
	constructor(handler) {
		super(handler, {
			aliases: ['delrep'],
			coins: 0,
			cooldown: 0,
			description: 'Deletes your reputation of a member.',
			examples: ['delrep @space#0302'],
			exp: 0,
			name: 'deletereputation',
			usage: 'deleterep <Member>',
			permLevel: 0
		});
	}

	async run(message, [target]) {
		if (!target) return message.reply('you need to tell me who you want to remove your reputation from.');

		const member = await this.handler.resolveMember(message.guild, target, false);
		if (!member) return message.reply(`I could not find a non-bot member by ${target}.`);

		const reputation = await UserReputation.findOne({ where: { repId: member.id, repperId: message.author.id } });
		if (!reputation) {
			return message.reply(`you never added a reputation to **${member.user.tag}**!`);
		}

		await reputation.destroy();

		return message.reply(
			`you successfully deleted your ${reputation.type.toLowerCase()} reputation from **${member.user.tag}**.`
		);
	}
}

module.exports = DeleteReputationCommand;
