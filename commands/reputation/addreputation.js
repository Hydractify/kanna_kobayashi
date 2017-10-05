const Command = require('../../structures/Command');

class AddReputationCommand extends Command {
	constructor(handler) {
		super(handler, {
			aliases: ['rep', 'addrep', '++'],
			coins: 0,
			cooldown: 0,
			description: 'Add a positive reputation to a member .',
			examples: ['addrep @space#0302'],
			exp: 0,
			name: 'addreputation',
			usage: 'addrep <Member>',
			permLevel: 0
		});
	}

	async run(message, [target]) {
		if (!target) return message.channel.send('You need to tell me who you want a positive reputation to.');

		const member = await this.handler.resolveMember(message.guild, target, false);
		const authorM = message.member || await message.guild.fetchMember(message.author);
		if (authorM === member) return message.channel.send(`You can't give a reputation point to yourself ${message.author}`)
		if (!member) return message.channel.send(`Could not find a non-bot member by ${target}.`);

		const [already] = await (member.user.model || await member.user.fetchModel())
			.getReps({ where: { sourceId: message.author.id } });
		if (already) {
			if (already.type === 'POSITIVE') {
				return message.channel.send(`You already added a positive reputation to **${member.user.tag}**.`);
			}

			already.type = 'POSITIVE';
			await already.save();

			return message.channel.send([
				'You successfully edited your reputation entry of',
				`**${member.user.tag}** to be positive.`
			].join(' '));
		}

		await message.author.model.createRepped({
			targetId: member.id,
			type: 'POSITIVE'
		});

		return message.channel.send(`You successfully added a positive reputation to **${member.user.tag}**.`);
	}
}

module.exports = AddReputationCommand;
