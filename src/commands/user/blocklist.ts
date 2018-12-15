import { Message, User } from 'discord.js';

import { User as UserModel } from '../../models/User';
import { Command } from '../../structures/Command';
import { CommandHandler } from '../../structures/CommandHandler';
import { ICommandRunInfo } from '../../types/ICommandRunInfo';

class BlockListCommand extends Command {
	constructor(handler: CommandHandler) {
		super(handler, {
			coins: 0,
			description: 'Block a user, disallowing them from using any interactive commands on you.',
			examples: ['block space'],
			exp: 0,
			usage: 'block <User>',
		});
	}

	public async run(message: Message, args: string[], { authorModel }: ICommandRunInfo): Promise<Message | Message[]> {
		const blocked: UserModel[] = await authorModel.$get('blocked') as UserModel[];

		if (!blocked.length) {
			await message.author.send('You did not block anybody.');
		} else {
			const tags: string[] = await Promise
				.all(blocked.map(
					(block: UserModel) => this.client.users.get(block.id) || this.client.users.fetch(block.id)),
				).then(
					(users: User[]) => users.map((user: User) => user.tag),
				);

			let out: string = '';
			for (const tag of tags) {
				if (tag.length + tags.length > 1900) {
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
}

export { BlockListCommand as Command };
