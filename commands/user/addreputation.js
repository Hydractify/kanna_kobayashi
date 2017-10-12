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
		if (!target) return message.reply('you need to tell me who you want to add a positive reputation to.');

		const member = await this.handler.resolveMember(message.guild, target, false);
		if (!member) return message.reply(`I could not find a non-bot member by ${target}.`);
		if (member.id === message.author.id) {
			return message.reply(`you can not add a reputation to yourself, ${message.author}`);
		}

		const [already] = await (member.user.model || await member.user.fetchModel())
			.getReps({ scope: { repperId: message.author.id } });
		if (already) {
			if (already.UserReputation.type === 'POSITIVE') {
				return message.reply(`you already added a positive reputation to **${member.user.tag}**.`);
			}

			already.UserReputation.type = 'POSITIVE';
			await already.UserReputation.save();

			return message.reply([
				'you successfully edited your reputation entry of',
				`**${member.user.tag}** to be positive.`
			].join(' '));
		}

		await message.author.model.addRepped(member.user.model, { through: { type: 'POSITIVE' } });

		return message.reply(`you successfully added a positive reputation to **${member.user.tag}**.`);
	}
}

module.exports = AddReputationCommand;
