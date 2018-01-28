import { Message, Util } from 'discord.js';

import { Client } from '../../structures/Client';
import { Command } from '../../structures/Command';
import { CommandHandler } from '../../structures/CommandHandler';

class DiscriminatorCommand extends Command {
	public constructor(handler: CommandHandler) {
		super(handler, {
			aliases: ['discrim'],
			coins: 0,
			description: 'Searches for user with a certain discriminator',
			examples: ['discrim 0001'],
			name: 'discriminator',
			usage: 'discriminator <Discriminator>',
		});
	}

	public filterAndMap(discriminator: string): string[] {
		const users: string[] = [];
		for (const user of this.client.users.values()) {
			if (user.discriminator === discriminator) {
				users.push(user.username);
			}
		}

		return users;
	}

	public parseArgs(message: Message, [discrim]: string[]): string | string[] {
		if (!discrim) return 'you have to tell me a discriminator!';

		if (discrim[0] === '#') discrim = discrim.slice(1);
		if (discrim === '0000') return '`0000` is not a valid discriminator!';
		if (!/^\d{4}$/.test(discrim)) {
			return [
				`That is not a valid discriminator, ${message.author}!`,
				'A valid discriminator must be a sequenze of 4 numbers except `0000`.',
			].join(' ');
		}

		return [discrim];
	}

	public async run(message: Message, [discrim]: string[]): Promise<Message | Message[]> {
		const users: string[] = await this.client.shard.broadcastEval(
			(client: Client, [name, disc]: string[]) =>
				(client.commandHandler.resolveCommand(name) as DiscriminatorCommand).filterAndMap(disc),
			[this.name, discrim],
		).then((res: string[][]) => [...new Set([].concat(...res))]);

		if (!users.length) {
			return message.reply(
				`I could not find any users with the \`${discrim}\` discriminator.`,
			);
		}

		const response: string = `I found the following users with the discriminator \`${discrim}\`:\n`;

		// 1998 instead of 2000 because of the ", " of each user
		const totalChars: number = 1998 - response.length;
		let usersString: string = '';
		for (let user of users) {
			// People love to have markdown chars in their names
			user = Util.escapeMarkdown(user);
			if (usersString.length + user.length >= totalChars) break;
			usersString += `, ${user}`;
		}

		return message.channel.send(response + usersString.slice(2));
	}
}

export { DiscriminatorCommand as Command };
