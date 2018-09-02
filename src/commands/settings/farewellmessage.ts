import { Message } from 'discord.js';

import { Guild } from '../../models/Guild';
import { Command } from '../../structures/Command';
import { CommandHandler } from '../../structures/CommandHandler';
import { PermLevels } from '../../types/PermLevels';

class FarewellMessageCommand extends Command {
	public constructor(handler: CommandHandler) {
		super(handler, {
			aliases: ['leavemessage'],
			coins: 0,
			description: 'Sets, displays, or removes the farewell message!',
			examples: [
				'farewellmessage',
				'farewellmessage remove',
				'farewellmessage farewell {{member}} to {{guild}}!',
			],
			exp: 0,
			permLevel: PermLevels.DEV,
			usage: 'farewellmessage <remove|...message>',
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
			if (!guild.farewellMessage) return message.reply('there currently is no farewell message set up!');

			return message.reply(`the current farewell message is:\n${guild.farewellMessage}`);
		}

		if (value === false) {
			if (!guild.farewellMessage) return message.reply('there currently is no farewell message set up!');

			guild.farewellMessage = null;
			await guild.save();

			return message.reply('removed the farewell message.');
		}

		guild.farewellMessage = value;
		await guild.save();

		return message.reply('set the farewell message.');
	}
}

export { FarewellMessageCommand as Command };
