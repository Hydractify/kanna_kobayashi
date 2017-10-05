const Command = require('../../structures/Command');
const RichEmbed = require('../../structures/RichEmbed');

class ShowReputationCommand extends Command {
	constructor(handler) {
		super(handler, {
			aliases: ['showrep'],
			coins: 0,
			cooldown: 0,
			description: 'Shows the reputation of a member.',
			examples: ['showrep @space#0302'],
			exp: 0,
			name: 'showreputation',
			usage: 'showrep <Member>',
			permLevel: 0
		});
	}

	async run(message, [target]) {
		let member;
		if (!target) member = message.member || await message.guild.fetchMember(message.author);
		else member = await this.handler.resolveMember(message.guild, target, false)

		if (!member) return message.channel.send(`Could not find a non-bot member by **${target}**.`);

		const targetModel = member.user.model || await member.user.fetchModel();
		const [positive, negative] = await Promise.all([
			targetModel.countReps({ where: { type: 'POSITIVE' } }),
			targetModel.countReps({ where: { type: 'NEGATIVE' } })
		]);
		if (!positive && !negative) return message.channel.send(`**${member.user.tag}**, does not have any reputations.`);

		const embed = RichEmbed.common(message)
			.setAuthor(`Reputation for ${member.user.tag}`, message.client.user.displayAvatarURL);
		// One is always present here
		if (positive) embed.addField('Positive', positive, true);
		if (negative) embed.addField('Negative', negative, true);

		return message.channel.send(embed);
	}
}

module.exports = ShowReputationCommand;
