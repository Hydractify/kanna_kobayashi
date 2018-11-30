import { Message } from 'discord.js';

import { Guild } from '../../models/Guild';
import { Command } from '../../structures/Command';
import { CommandHandler } from '../../structures/CommandHandler';
import { ICommandRunInfo } from '../../types/ICommandRunInfo';
import { PermLevels } from '../../types/PermLevels';

class EnableCommandCommand extends Command {
	public constructor(handler: CommandHandler) {
		super(handler, {
			aliases: ['enable'],
			coins: 0,
			description: 'Enable a command',
			examples: ['enable say', 'enable sayd'],
			exp: 0,
			guarded: true,
			permLevel: PermLevels.HUMANTAMER,
			usage: 'enablecommand <Command>',
		});
	}

	public parseArgs(message: Message, args: string[]): [Command] | string {
		if (!args.length) return `you have to give me a command to enable (\`${this.usage}\`)`;

		const command: Command | undefined = this.handler.resolveCommand(args.join(' ').toLocaleLowerCase());

		if (!command) {
			return 'I could not find a command with that name or alias.';
		} else if (!message.guild.model.disabledCommands.includes(command.name)) {
			return `the **${command.name}** command is already server wide enabled.`;
		}

		return [command];
	}

	public async run(message: Message, [command]: [Command], info: ICommandRunInfo): Promise<Message | Message[]> {
		const guildModel: Guild = message.guild.model;
		guildModel.disabledCommands.splice(
			guildModel.disabledCommands.indexOf(command.name),
			1,
		);
		guildModel.changed('disabledCommands', true);
		await guildModel.save();

		return message.reply(`the **${command.name}** command is now enabled server wide!`);
	}
}

export { EnableCommandCommand as Command };
