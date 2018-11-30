import { Message } from 'discord.js';

import { Guild } from '../../models/Guild';
import { Command } from '../../structures/Command';
import { CommandHandler } from '../../structures/CommandHandler';
import { ICommandRunInfo } from '../../types/ICommandRunInfo';
import { PermLevels } from '../../types/PermLevels';

class DisableCommandCommand extends Command {
	public constructor(handler: CommandHandler) {
		super(handler, {
			aliases: ['disable'],
			coins: 0,
			description: 'Disable a command',
			examples: ['disable say', 'disable sayd'],
			exp: 0,
			guarded: true,
			permLevel: PermLevels.HUMANTAMER,
			usage: 'disablecommand <Command>',
		});
	}

	public parseArgs(message: Message, args: string[]): [Command] | string {
		if (!args.length) return `you have to give me a command to disable (\`${this.usage}\`)`;

		const command: Command | undefined = this.handler.resolveCommand(args.join(' ').toLocaleLowerCase());

		if (!command) {
			return 'I could not find a command with that name or alias.';
		} else if (command.guarded) {
			return `the **${command.name}** command may not be disabled.`;
		} else if (message.guild.model.disabledCommands.includes(command.name)) {
			return `the **${command.name}** command is already disabled server wide.`;
		}

		return [command];
	}

	public async run(message: Message, [command]: [Command], info: ICommandRunInfo): Promise<Message | Message[]> {
		const guildModel: Guild = message.guild.model;
		guildModel.disabledCommands.push(command.name);
		guildModel.changed('disabledCommands', true);
		await guildModel.save();

		return message.reply(`the **${command.name}** command is now disabled server wide!`);
	}
}

export { DisableCommandCommand as Command };
