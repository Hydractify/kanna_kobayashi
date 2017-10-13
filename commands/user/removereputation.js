const Command = require('../../structures/Command');
const UserReputation = require('../../models/UserReputation');

class RemoveReputationCommand extends Command {
	constructor(handler) {
		super(handler, {
			aliases: ['removerep', '--'],
			coins: 0,
			cooldown: 0,
			description: 'Add a negative reputation to a member.',
			examples: ['removerep @space#0302'],
			exp: 0,
			name: 'removereputation',
			usage: 'removerep <Member>',
			permLevel: 0
		});
	}

	async run(message, [target]) {
		if (!target) return message.reply('you need to tell me who you want to add a negative reputation to.');

		const member = await this.handler.resolveMember(message.guild, target, false);
		if (!member) return message.reply(`I could not find a non-bot member by ${target}.`);
		if (member.id === message.author.id) {
			return message.reply(`you can not give a reputation point to yourself, ${message.author}`);
		}

		const reputation = await UserReputation.findOne({ where: { repId: member.id, repperId: message.author.id } });
		if (reputation) {
			if (reputation.type === 'NEGATIVE') {
				return message.reply(`you already added a negative reputation to **${member.user.tag}**.`);
			}

			reputation.type = 'NEGATIVE';
			await reputation.save();

			return message.reply([
				'you successfully edited your reputation of',
				`**${member.user.tag}** to be negative.`
			].join(' '));
		}

		await UserReputation.create({ repId: member.id, repperId: message.author.id, type: 'NEGATIVE' });

		return message.reply(`you successfully added a negative reputation to **${member.user.tag}**.`);
	}
}

module.exports = RemoveReputationCommand;
