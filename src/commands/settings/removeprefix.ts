import { Message } from 'discord.js';

import { Command } from '../../structures/Command';
import { CommandHandler } from '../../structures/CommandHandler';
import { GuildMessage } from '../../types/GuildMessage';
import { PermLevels } from '../../types/PermLevels';

class RemovePrefixCommand extends Command
{
	public constructor(handler: CommandHandler)
	{
		super(handler, {
			description: 'Removes the custom prefix.',
			examples: ['removeprefix'],
			exp: 0,
			guarded: true,
			permLevel: PermLevels.HUMANTAMER,
			usage: 'removeprefix',
		});
	}

	public async run(message: GuildMessage): Promise<Message | Message[]>
	{
		if (!message.guild.model.prefix) return message.reply('there is no custom prefix set up.');

		message.guild.model.prefix = null;
		await message.guild.model.save();

		return message.reply('you removed the custom prefix.');
	}
}

export { RemovePrefixCommand as Command };
