const Command = require('../../structures/Command');

class BlacklistCommand extends Command {
	constructor(handler) {
		super(handler, {
			coins: 0,
			cooldown: 0,
			description: 'Blacklists a user, disallowing them and their guilds to use the bot.',
			examples: ['blacklist @space#0302'],
			exp: 0,
			name: 'blacklist',
			usage: 'blacklist <User> [\'remove\']',
			permLevel: 4
		});
	}

	async run(message, [target, remove]) {
		// To allow nicknames, I am so sure they will be used.
		let user = await this.handler.resolveMember(message.guild, target, false)
			.then(member => member ? member.user : null);
		if (!user) user = await this.client.fetchUser(target).catch(() => null);
		if (!user || user.bot) return message.reply(`I could not find a non-bot user by ${target}!`);

		const targetModel = await user.fetchModel();
		if (['DEV', 'TRUSTED'].includes(targetModel.type)) {
			return message.reply(`devs or trusted users can not be blacklisted. Maybe entered the wrong user?`);
		}

		if (targetModel.type === 'BLACKLISTED') {
			if (remove === 'remove') {
				targetModel.type = null;
				await targetModel.save();

				return message.reply(`you removed **${user.tag}** from the blacklist.`);
			}

			return message.reply(`**${user.tag}** is already blacklisted.`);
		} else if (remove === 'remove') {
			return message.reply(`**${user.tag}** is not blacklisted.`);
		}

		targetModel.type = 'BLACKLISTED';
		await targetModel.save();

		return message.reply(`you added **${user.tag}** to the blacklist.`);
	}
}

module.exports = BlacklistCommand;
