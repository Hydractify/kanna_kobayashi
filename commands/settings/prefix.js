const Command = require('../../structures/Command');

class PrefixCommand extends Command {
	constructor(handler) {
		super(handler, {
			coins: 0,
			description: 'Gets all available prefixes or sets a custom one.',
			examples: [
				'prefix',
				'prefix "kamui "',
				'prefix $'
			],
			exp: 0,
			name: 'prefix',
			usage: 'prefix [...prefix]',
			// Allow everyone to look
			permLevel: 0
		});
	}

	async run(message, args) {
		if (!args.length) {
			const prefixes = `always working prefixes are: \`@${this.client.user.tag} \u200b\`, \`k!\` and \`kanna \u200b\``;
			if (!message.guild.model.prefixes.length) {
				return message.reply(prefixes);
			}

			return message.reply(
				`${prefixes}\nAdditionally in this guild added: \`${message.guild.model.prefixes[0]}\u200b\``
			);
		}

		// Disallow every non "mod" to change
		if (message.member.permLevel(await message.author.fetchModel()) < 2) {
			return message.reply(`you do not have the required permission level to set a prefix!`);
		}

		let newPrefix = args.join(' ');
		if (newPrefix[0] === '"' && newPrefix[newPrefix.length - 1] === '"') {
			newPrefix = newPrefix.slice(1, -1);
		}

		message.guild.model.prefixes[0] = newPrefix;
		await message.guild.model.save();

		return message.reply(`set the guild specific prefix to \`${newPrefix}\u200b\``);
	}
}

module.exports = PrefixCommand;
