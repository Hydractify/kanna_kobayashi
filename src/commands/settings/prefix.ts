import { Message } from 'discord.js';

import { Command } from '../../structures/Command';
import { CommandHandler } from '../../structures/CommandHandler';
import { ICommandRunInfo } from '../../types/ICommandRunInfo';

class PrefixCommand extends Command {
	public constructor(handler: CommandHandler) {
		super(handler, {
			coins: 0,
			description: 'Gets all available prefixes or sets a custom one.',
			examples: [
				'prefix',
				'prefix "kamui "',
				'prefix $',
			],
			exp: 0,
			name: 'prefix',
			usage: 'prefix [...Prefix]',
		});
	}

	public parseArgs(message: Message, args: string[], { authorModel }: ICommandRunInfo): string | [string] {
		if (args.length) {
			if (authorModel.permLevel(message.member) < 2) {
				return 'you do not have the required permission level to change the prefix!';
			}

			let newPrefix: string = args.join(' ');
			if (newPrefix[0] === '"' && newPrefix[newPrefix.length - 1] === '"') {
				newPrefix = newPrefix.slice(1, -1);
			}

			if (newPrefix.length > 32) return 'the prefix you inputted is too long! Try a different one.';

			// Set as new one
			return [newPrefix];
		}

		// Respond with the current one
		return [undefined];
	}

	public async run(message: Message, [newPrefix]: [string]): Promise<Message | Message[]> {
		if (!newPrefix) {
			const prefixes: string =
				`always working prefixes are: \`@${this.client.user.tag} \u200b\`, \`k!\` and \`kanna \u200b\``;
			if (!message.guild.model.prefix) {
				return message.reply(prefixes);
			}

			return message.reply(
				`${prefixes}\nAdditionally in this guild set: \`${message.guild.model.prefix}\u200b\``,
			);
		}

		message.guild.model.prefix = newPrefix;
		await message.guild.model.save();

		return message.reply(`you set the guild specific prefix to \`${newPrefix}\u200b\``);
	}
}

export { PrefixCommand as Command };
