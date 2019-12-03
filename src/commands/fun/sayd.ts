import { Constants, Message } from 'discord.js';

import { Command } from '../../structures/Command';
import { CommandHandler } from '../../structures/CommandHandler';
import { GuildMessage } from '../../types/GuildMessage';
import { ICommandRunInfo } from '../../types/ICommandRunInfo';
import { catchErrors } from '../../util/Util';

class SayDeleteCommand extends Command
{
	public constructor(handler: CommandHandler)
	{
		super(handler, {
			aliases: ['sayd'],
			clientPermissions: ['MANAGE_MESSAGES'],
			description: 'Let me say something and delete your message afterwards',
			examples: ['sayd Hello world!'],
			usage: 'sayd <...Message>',
		});
	}

	public parseArgs(message: GuildMessage, args: string[], { commandName }: ICommandRunInfo): string | string[]
	{
		if (!args.length) return 'you need to give me something to say!';

		return [message.cleanContent.slice(message.cleanContent.indexOf(commandName) + commandName.length)];
	}

	public async run(message: GuildMessage, [content]: string[]): Promise<Message | Message[]>
	{
		if (!message.deleted)
		{
			await message.delete().catch(catchErrors(Constants.APIErrors.UNKNOWN_MESSAGE));
		}

		return message.channel.send(content);
	}
}

export { SayDeleteCommand as Command };
