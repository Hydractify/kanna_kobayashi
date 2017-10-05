const Command = require('../../structures/Command');

class DeleteReputationCommand extends Command {
	constructor(handler) {
		super(handler, {
			aliases: ['delrep'],
			coins: 0,
			cooldown: 0,
			description: 'Deletes your reputation entry of a member.',
			examples: ['delrep @space#0302'],
			exp: 0,
			name: 'deletereputation',
			usage: 'deleterep <Member>',
			permLevel: 0
		});
	}

	async run(message, [target]) {
		if (!target) return message.channel.send('You need to tell me who you want to remove your reputation from.');

		const member = await this.handler.resolveMember(message.guild, target, false);
		if (!member) return message.channel.send(`Could not find a non-bot member by ${target}.`);

		const [reputation] = await message.author.model.getRepped({ where: { targetId: member.id } });
		if (!reputation) {
			return message.channel.send(`You never added a reputation to **${member.user.tag}**!`);
		}

		await reputation.destroy();

		return message.channel.send(`Successfully deleted your reputation entry of **${member.user.tag}**.`);
	}
}

module.exports = DeleteReputationCommand;
