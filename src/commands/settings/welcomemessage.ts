import { Message } from 'discord.js';

import { Guild } from '../../models/Guild';
import { Command } from '../../structures/Command';
import { CommandHandler } from '../../structures/CommandHandler';
import { PermLevels } from '../../types/PermLevels';

class WelcomeMessageCommand extends Command {
	public constructor(handler: CommandHandler) {
		super(handler, {
			aliases: ['joinmessage', 'welcome'],
			description: 'Sets, displays, or removes the welcome message!',
			examples: [
				'welcomemessage',
				'welcomemessage remove',
				'welcomemessage Welcome {{member}} to {{guild}}!',
			],
			exp: 0,
			permLevel: PermLevels.HUMANTAMER,
			usage: 'welcomemessage <remove|...message>',
		});
	}

	public parseArgs(message: Message, args: string[]): [string | false | undefined] {
		if (!args.length) return [undefined];
		if (args[0].toLowerCase() === 'remove') return [false];
		return [args.join(' ')];
	}

	public async run(message: Message, [value]: [string | false | undefined])
		: Promise<Message | Message[]> {
		const guild: Guild = message.guild.model;

		if (value === undefined) {
			if (!guild.welcomeMessage) return message.reply('there currently is no welcome message set up!');

			return message.reply(`the current welcome message is:\n${guild.welcomeMessage}`);
		}

		if (value === false) {
			if (!guild.welcomeMessage) return message.reply('there currently is no welcome message set up!');

			guild.welcomeMessage = null;
			await guild.save();

			return message.reply('removed the welcome message.');
		}

		guild.welcomeMessage = value;
		await guild.save();

		return message.reply('set the welcome message.');
	}
}

export { WelcomeMessageCommand as Command };
