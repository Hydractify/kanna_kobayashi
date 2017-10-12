const Command = require('../../structures/Command');
const RichEmbed = require('../../structures/RichEmbed');
const UserReputation = require('../../models/UserReputation');

class ShowReputationCommand extends Command {
	constructor(handler) {
		super(handler, {
			clientPermissions: ['EMBED_LINKS'],
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
		const member = target
			? await this.handler.resolveMember(message.guild, target, false)
			: message.member;

		if (!member) return message.reply(`I could not find a non-bot member by **${target}**.`);

		const { POSITIVE: positive = 0, NEGATIVE: negative = 0 } = await UserReputation.count({
			where: { repId: member.id },
			attributes: ['type'],
			group: ['type']
		}).then(results => {
			const reps = {};
			for (const result of results) reps[result.type] = result.count;
			return reps;
		});
		if (!positive && !negative) return message.reply(`**${member.user.tag}** does not have any reputations.`);

		const embed = RichEmbed.common(message)
			.setAuthor(`Reputation for ${member.user.tag}`, message.client.user.displayAvatarURL);
		// One is always present here
		if (positive) embed.addField('Positive', positive, true);
		if (negative) embed.addField('Negative', negative, true);

		return message.channel.send(embed);
	}
}

module.exports = ShowReputationCommand;
