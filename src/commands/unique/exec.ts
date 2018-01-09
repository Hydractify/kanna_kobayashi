import { exec } from 'child_process';
import { Message, MessageAttachment } from 'discord.js';
import { promisify } from 'util';

import { Command } from '../../structures/Command';
import { CommandHandler } from '../../structures/CommandHandler';
import { IExecResult } from '../../types/IExecResult';
import { PermLevels } from '../../types/PermLevels';

const execAsync: (command: string) => Promise<IExecResult> = promisify(exec);

class ExecCommand extends Command {
	public constructor(handler: CommandHandler) {
		super(handler, {
			coins: 0,
			cooldown: 0,
			description: 'Executes arbitrary input on the command line.',
			examples: ['echo hi'],
			exp: 0,
			name: 'exec',
			permLevel: PermLevels.DEV,
			usage: 'exec <command>',
		});
	}

	public async run(message: Message, args: string[]): Promise<Message | Message[]> {
		const statusMessage: Message = await message.channel.send('Executing...') as Message;
		const { error, stdout, stderr }: IExecResult = await execAsync(args.join(' '))
			.catch((err: Error & { stderr: string; stdout: string }) =>
				({ err, stdout: err.stdout, stderr: err.stderr }));

		const response: string = (error && error.code ? `\`Error Code: ${error.code}\`\n\n` : '')
			+ (stdout ? `\`STDOUT\`\n\`\`\`xl\n${stdout}\`\`\`\n\n` : '')
			+ (stderr ? `\`STDERR\`\n\`\`\`xl\n${stderr}\`\`\`\n\n` : '');

		if (response.length <= 2000) {
			return statusMessage.edit(response);
		}

		statusMessage.edit('Executed...');

		return message.channel.send(new MessageAttachment(Buffer.from(response), 'output.txt'));
	}
}

export { ExecCommand as Command };
