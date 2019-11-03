import { Constants, DiscordAPIError, Message, User } from 'discord.js';

import { User as UserModel } from '../../models/User';
import { Command } from '../../structures/Command';
import { CommandHandler } from '../../structures/CommandHandler';
import { Emojis } from '../../types/Emojis';
import { GuildMessage } from '../../types/GuildMessage';
import { ICommandRunInfo } from '../../types/ICommandRunInfo';

const { APIErrors } = Constants;

class BlockListCommand extends Command 
{
	constructor(handler: CommandHandler) 
	{
		super(handler, {
			description: 'Block a user, disallowing them from using any interactive commands on you.',
			examples: ['block space'],
			exp: 0,
			usage: 'block <User>',
		});
	}

	public async run(
		message: GuildMessage,
		args: string[],
		{ authorModel }: ICommandRunInfo,
	): Promise<Message | Message[]> 
	{
		const blocked: UserModel[] = await authorModel.$get('blocked') as UserModel[];

		try 
		{
			if (!blocked.length) 
			{
				await message.author.send('You did not block anybody.');
			}
			else 
			{
				const tags: string[] = await Promise
					.all(blocked.map(
						(block: UserModel) => this.client.users.get(block.id) || this.client.users.fetch(block.id)),
					).then(
						(users: User[]) => users.map((user: User) => user.tag),
					);

				let out: string = '';
				for (const tag of tags) 
				{
					if (tag.length + tags.length > 1900) 
					{
						out += '...';
						break;
					}

					out += `, **${tag}**`;
				}
				out = out.slice(2);

				await message.author.send(`The users you blocked from using interactive commands on you:\n${out}`);
			}

			return message.reply('sent you the requested info.');
		}
		catch (e) 
		{
			if ((e as DiscordAPIError).code === APIErrors.CANNOT_MESSAGE_USER) 
			{
				return message.reply([
					'I have failed to send a DM to you!',
					'Check if you have disabled your DMs or',
					'if you have me blocked.',
					Emojis.KannaShy,
				].join(' '));
			}

			return Promise.reject(e);
		}

	}
}

export { BlockListCommand as Command };
