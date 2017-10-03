const Command = require('../../structures/Command');

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
		const member = await this.handler.resolveMember(message.guild, target, false);
		if (!member) return message.channel.send(`Could not find a non-bot member by ${target}.`);

		const [already] = await (member.user.model || await member.user.fetchModel())
			.getReps({ where: { sourceId: message.author.id } });
		if (already) {
			if (already.type === 'NEGATIVE') {
				return message.channel.send(`You already added a negative reputation to **${member.user.tag}**.`);
			}

			already.type = 'NEGATIVE';
			await already.save();

			return message.channel.send([
				'You successfully edited your reputation entry of',
				`**${member.user.tag}** to be negative.`
			].join(' '));
		}

		await message.author.model.createRepped({
			targetId: member.id,
			type: 'NEGATIVE'
		});

		return message.channel.send(`You successfully added a negative reputation to **${member.user.tag}**.`);
	}
}

module.exports = RemoveReputationCommand;
