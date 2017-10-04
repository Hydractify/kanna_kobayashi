const Command = require('../../structures/Command');

class WhitelistCommand extends Command {
	constructor(handler) {
		super(handler, {
			coins: 0,
			cooldown: 0,
			description: 'Whitelists a user, allowing their bot guilds to use the bot.',
			examples: ['whitelist @space#0302'],
			exp: 0,
			name: 'whitelist',
			usage: 'whitelist <User> [\'remove\']',
			permLevel: 4
		});
	}

	async run(message, [target, remove]) {
		// To allow nicknames, I am so sure they will be used.
		let user = await this.handler.resolveMember(message.guild, target, false);
		if (!user) user = await this.client.fetchUser(target).catch(() => null);
		if (!user || user.bot) return message.channel.send(`Could not find a non-bot user by ${target}!`);

		const targetModel = user.model || await user.fetchModel();
		if (['DEV', 'TRUSTED'].includes(targetModel.type)) {
			return message.channel.send(`Devs or trusted users can not be whitelisted. Maybe entered the wrong user?`);
		}

		if (targetModel.type === 'WHITELISTED') {
			if (remove === 'remove') {
				targetModel.type = null;
				await targetModel.save();

				return message.channel.send(`**${user.tag}** has been removed from the whitelist.`);
			}

			return message.channel.send(`**${user.tag}** is already whitelisted.`);
		}

		targetModel.type = 'WHITELISTED';
		await targetModel.save();

		return message.channel.send(`**${user.tag}** has been added to the whitelist.`);
	}
}

module.exports = WhitelistCommand;
