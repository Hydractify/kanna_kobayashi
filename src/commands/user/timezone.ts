import { Message } from 'discord.js';

import { Command } from '../../structures/Command';
import { CommandHandler } from '../../structures/CommandHandler';
import { ICommandRunInfo } from '../../types/ICommandRunInfo';

class TimezoneCommand extends Command {
	constructor(handler: CommandHandler) {
		super(handler, {
			aliases: ['tz'],
			description: 'Checks or sets your own timezone!',
			examples: ['timezone -3'],
			exp: 0,
			usage: 'timezone [UTC Offset]',
		});
	}

	public parseArgs(
		message: Message,
		args: string[],
		{ authorModel }: ICommandRunInfo,
	): number[] | string {
		if (authorModel.timezone && !args.length) {
			const timezone = authorModel.timezone > 0 ? `+${authorModel.timezone}` : authorModel.timezone;
			return `your timezone is __${timezone} UTC__.`;
		}
		if (!args.length) return 'you do not have a timezone set!';

		const offset: number = parseInt(args[0]);
		if ((!offset && offset !== 0) || offset > 12 || Math.abs(offset) > 12) {
			return `**${args[0]}** is not a valid timezone!`;
		}

		return [offset];
	}

	public async run(
		message: Message,
		[offset]: number[],
		{ authorModel }: ICommandRunInfo,
	): Promise<Message | Message[]> {
		authorModel.timezone = offset;
		await authorModel.save();

		const timezone = offset > 0 ? `+${offset}` : offset;
		return message.reply(`your timezone has successfully changed to **${timezone}**.`);
	}
}

export { TimezoneCommand as Command };
