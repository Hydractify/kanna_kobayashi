import { Message } from 'discord.js';

import { Guild } from '../../models/Guild';
import { Command } from '../../structures/Command';
import { CommandHandler } from '../../structures/CommandHandler';
import { ICommandRunInfo } from '../../types/ICommandRunInfo';
import { PermLevels } from '../../types/PermLevels';

class CommandStatusCommand extends Command {
	public constructor(handler: CommandHandler) {
		super(handler, {
			aliases: ['disable', 'enable'],
			coins: 0,
			description: 'Enable, disable, or see the status of a command.',
			examples: ['command', 'command say', 'disable say', 'enable say'],
			exp: 0,
			guarded: true,
			name: 'commandstatus',
			usage: 'commandstatus [Command]',
		});
	}

	public parseArgs(message: Message, args: string[], { authorModel, commandName }: ICommandRunInfo): Command[] | string {
		const command: Command = this.handler.resolveCommand(args.join(' ').toLowerCase());
		if (commandName === this.name) {
			if (!args.length) return [];
		} else if (!command) {
			return 'I could not find a command with that name or alias.';
		} else if (authorModel.permLevel(message.member) < PermLevels.HUMANTAMER) {
			return `you do not have the required permissions to ${commandName} commands.`;
		} else if (command.guarded) {
			return `the **${command.name}** command may not be ${commandName}d.`;
		}

		return command ? [command] : 'I could not find a command with that name or alias.';
	}

	public async run(
		message: Message,
		[command]: [Command],
		{ commandName }: ICommandRunInfo,
	): Promise<Message | Message[]> {
		const guildModel: Guild = message.guild.model;
		const status: boolean = !guildModel.disabledCommands.includes(command.name);

		if (commandName === this.name) {
			if (command) {
				return message.reply([
					`the **${command.name}** command is currently server wide ${status ? 'enabled' : 'disabled'}.`,
					'',
					`If you intended to get help about the **${command.name}** command instead, use \`k!help ${command.name}\`.`,
				].join('\n'));
			}

			if (!guildModel.disabledCommands.length) {
				return message.reply([
					'there are currently not commands disabled.',
					'',
					'If you intended to get a list of available commands instead, try `k!help`.',
				]);
			}

			return message.reply([
				'the following commands are currently server wide disabled:',
				guildModel.disabledCommands.join(', '),
				'',
				'If you intended to get a list of available commands instead, try `k!help`.',
			]);
		}

		const newStatus: boolean = commandName === 'enable';

		if (status === newStatus) {
			return message.reply(`the **${command.name}** command is already server wide ${status ? 'eanbled' : 'disabled'}!`);
		}

		// Sequelize wants us to reassign, here you go
		if (newStatus) {
			const commands: Set<string> = new Set(message.guild.model.disabledCommands);
			commands.delete(command.name);
			guildModel.disabledCommands = [...commands];
		} else {
			const commands: string[] = message.guild.model.disabledCommands;
			commands.push(command.name);
			guildModel.disabledCommands = commands;
		}

		await guildModel.save();

		return message.reply(`the **${command.name}** command is now server wide ${newStatus ? 'enabled' : 'disabled'}!`);
	}
}

export { CommandStatusCommand as Command };
